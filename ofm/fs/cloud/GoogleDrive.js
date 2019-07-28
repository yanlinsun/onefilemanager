'use strict';
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { remote } = require('electron');
const { BrowserWindow, ipcMain } = remote;

const FileSystemName = require('../FileSystemEnum.js').GoogleDrive;
const CloudProvider = require('../CloudProvider.js');
const File = require('../File.js');
const log = require('../../trace/Log.js');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_FILE = './config/googledrive.token.json';
const CREDENTIAL_FILE = './config/googledrive.credential.json';

class GoogleDrive extends CloudProvider {
    constructor() {
        super(FileSystemName);
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

    async connect() {
        let credentials = await lfs.readFile(CREDENTIAL_FILE);
        log.debug("Google Drive credentials: %s", credentials);
        credentials = JSON.parse(credentials);
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        this.auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        let token;
        try {
            token = await lfs.readFile(TOKEN_FILE);
            log.debug("Google Drive use saved token: [%s]", token);
            token = JSON.parse(token);
        } catch (err) {
            if (err.code === 'ENOENT') {
                token = await this.getAccessToken(this.auth);
                log.debug("Google Drive got token from remote: [%s]", JSON.stringify(token));
                lfs.writeFile(TOKEN_FILE, token);
            } else {
                throw err;
            }
        }
        this.auth.setCredentials(token);
        this.drive = google.drive({version: 'v3', auth: this.auth});
        return true;
    }

    async getAccessToken(oAuth2Client) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'online',
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
                    reject(-1);
                }
            });
            win.webContents.on('will-navigate', (e, url) => {
                log.debug("GoogleDrive navigate: [%s]", url);
                this.handleOAuthUrl(url, win, resolve, reject);
            });
            win.webContents.on('will-redirect', (e, url) => {
                log.debug("GoogleDrive redirect load: [%s]", url);
                this.handleOAuthUrl(url, win, resolve, reject);
            });
        });
        let code = await p;
        log.debug("GoogleDrive got code [%s]", code);
        return await oAuth2Client.getToken(code);
    }

    async disconnect() {
    }

    async listDir(fullpath) {
        let p = new Promise((resolve, reject) => {
            this.drive.files.list({
                pageSize: 10,
                fields: 'nextPageToken, files(id, name)',
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
        return files.map(f => {
            let file = new File(fullpath, f.name);
            file.fs = FileSystemName;
            file.id = f.id;
            return file;
        });
    }

    async getFile(fullpath) {
    }

    async download(fullpath) {
    }

    async upload(fullpath, buffer) {
    }
}

module.exports = GoogleDrive;
