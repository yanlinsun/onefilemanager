'use strict';
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { remote } = require('electron');
const { BrowserWindow, ipcMain } = remote;

const ThisProvider = require('./Provider.js').GoogleDrive;
const CloudFileSystem = require('../FileSystemEnum.js').CloudFileSystem;
const CloudProvider = require('./CloudProvider.js');
const File = require('../File.js');
const FileType = require('../FileType.js');
const log = require('../../trace/Log.js');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
let TOKEN_FILE = './config/googledrive.token.json';
let CREDENTIAL_FILE = './config/googledrive.credential.json';

class GoogleDrive extends CloudProvider {
    constructor(name) {
        super(name, ThisProvider);
        if (name !== 'Default') {
            TOKEN_FILE = './config/googledrive.' + name.toLowerCase() + '.token.json';
            CREDENTIAL_FILE = './config/googledrive.' + name.toLowerCase() + '.credential.json';
        }
    }

    getProperty() {
        let p = {}; 
        p.pingable = false;
        p.maxSingleFileSize = 2 * 1024 * 1024;
        p.maxFilenameLength = 256;
        p.invalidFilenameChars = "\\/";
        return p;
    }

    async getUserProperty() {
    }

    async connect(showLoginScreen) {
        let credentials = await lfs.readFile(CREDENTIAL_FILE);
        log.debug("%s credentials: %s", this.providerId, credentials);
        credentials = JSON.parse(credentials);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        let token, file, refreshToken;
        try {
            token = await lfs.readFile(TOKEN_FILE);
            token = JSON.parse(token);
            log.debug("%s use saved token: [%s]", this.providerId, TOKEN_FILE);
            log.debug(token);
            if (token.refresh_token) {
                refreshToken = token.refresh_token;
            } else {
                if (!isNaN(token.expires_in)) {
                    file = await lfs.getFile(TOKEN_FILE);
                    if (new Date().getTime() >= file.date.getTime() + token.expires_in * 1000) {
                        log.debug("%s token expired", this.providerId);
                        token = null;
                    }
                } else if (!isNaN(token.expiry_date)) {
                    if (new Date().getTime() >= token.expiry_date) {
                        log.debug("%s token expired", this.providerId);
                        token = null;
                    }
                } else {
                    log.debug("%s malfomed token", this.providerId);
                    token = null;
                }
            }
        } catch (err) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
            log.error(err);
            token = null;
        }
        if (!token) {
            if (showLoginScreen) {
                token = await this.getAccessToken(this.auth);
            } else {
                return false;
            }
        }
        this.auth.setCredentials(token);
        this.drive = google.drive({version: 'v3', auth: this.auth});
        return true;
    }

    async getAccessToken(oAuth2Client) {
        log.debug("%s Google Drive grab new token", this.providerId);
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES,
        });
        let p = new Promise((resolve, reject) => {
            let code = null;
            let win = new BrowserWindow({
                width: 640,
                height: 480,
            });
            win.loadURL(authUrl);
            win.on('closed', () => { 
                win = null;
                if (!code) {
                    let err = new Error("User cancelled");
                    err.code = 'ECANCELLED';
                    err.message = "User cancelled";
                    reject(err);
                }
            });
            win.webContents.on('will-navigate', (e, url) => {
                log.debug("%s navigate: [%s]", this.providerId, url);
                this.handleOAuthUrl(url, win, resolve, reject);
            });
            win.webContents.on('will-redirect', (e, url) => {
                log.debug("%s redirect load: [%s]", this.providerId, url);
                this.handleOAuthUrl(url, win, resolve, reject);
            });
        });
        let code = await p;
        log.debug("%s got code [%s]", this.providerId, code);
        let { tokens } = await oAuth2Client.getToken(code);
        log.debug("%s got token from remote: [%s]", this.providerId, JSON.stringify(tokens));
        lfs.writeFile(TOKEN_FILE, JSON.stringify(tokens));
        return tokens;
    }

    async disconnect() {
    }

    getQStringForList(file) {
        let r = "";
        if (this.isRoot(file)) {
            r += "('root' in parents or sharedWithMe)";
        } else {
            r += "'" + file.original.id + "' in parents";
        }
        r += " and trashed=false";
        return r;
    }

    async listDir(dir) {
        log.debug("%s List Dir: [%s]", this.providerId, dir.fullpath);
        let p = new Promise((resolve, reject) => {
            this.drive.files.list({
                pageSize: 1000,
                fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, description, shared, size, webContentLink, exportLinks)',
                q: this.getQStringForList(dir)
            }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    log.debug(res);
                    resolve(res.data.files);
                }
            });
        });
        let files = await p;
        files = files.map(f => this.newFile(dir, f));
        return files;
    }

    isRoot(dir) {
        return dir.original.root === true;
    }

    rootDir() {
        let f = new File(this.providerId, window.cloudfs);
        f.cloudProvider = this.providerId;
        f.original = {
            root : true,
            id : 'root'
        };
        f.type = FileType.Directory;
        f.isDirectory = true;
        return f;
    }

    newFile(dir, original) {
        let f = new File(dir.fullpath + "/" + original.name, window.cloudfs);
        f.cloudProvider = this.providerId;
        f.original = original;
        this.setFileType(f, original.mimeType);
        f.size = original.size;
        f.date = new Date(original.modifiedTime);
        f.description = original.description;
        return f;
    }

    setFileType(f, mimeType) {
        // default mime type can be handled by file extension
        switch (mimeType) {
            case "application/vnd.google-apps.folder":
                f.isDirectory = true;
                f.type = FileType.Directory;
                break;
            case "application/vnd.google-apps.map":
                f.type = FileType.All.map;
                break;
            case "application/vnd.google-apps.document":
                f.type = { description: "Google Document", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.document":
                f.type = { description: "Google Docs", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.drawing":
                f.type = { description: "Google Drawing", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.file":
                f.type = { description: "Google Drive file", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.folder":
                f.type = { description: "Google Drive folder", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.form":
                f.type = { description: "Google Forms", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.fusiontable":
                f.type = { description: "Google Fusion Tables", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.map":
                f.type = { description: "Google My Maps", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.presentation":
                f.type = { description: "Google Slides", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.script":
                f.type = { description: "Google Apps Scripts", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.site":
                f.type = { description: "Google Sites", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.spreadsheet":
                f.type = { description: "Google Sheets", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.unknown":
                f.type = { description: "", icon: FileType.TypeIcon.default };
                break;
            case "application/vnd.google-apps.drive-sdk":
                f.type = { description: "3rd party shortcut", icon: FileType.TypeIcon.default };
                break;
//            case "application/vnd.google-apps.video":
//                f.type = { description: "Video", icon: FileType.TypeIcon.video };
//                break;
//            case "application/vnd.google-apps.audio":
//                f.type = { description: "Audio", icon: FileType.TypeIcon.audio };
//                break;
//            case "application/vnd.google-apps.photo":
//                f.type = { description: "Image", icon: FileType.TypeIcon.image };
//                break;
        }
    }

    async getFile(fullpath) {
    }

    async download(fullpath) {
    }

    async upload(fullpath, buffer) {
    }
}

module.exports = GoogleDrive;
