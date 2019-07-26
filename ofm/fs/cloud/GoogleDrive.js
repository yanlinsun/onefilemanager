'use strict';
const FileSystemName = require('../FileSystemEnum.js').GoogleDrive;
const CloudProvider = require('../CloudProvider.js');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_FILE = './config/googledrive.token.json';
const CREDENTIAL_FILE = './config/googledrive.credential.json';
const log = require('../../trace/Log.js');

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
            log.debug("Google Drive token: %s", credentials);
        } catch (err) {
            if (err.code === 'ENOENT') {
                token = await this.getAccessToken(this.auth);
                log.debug("Google Drive token from remote: %s", credentials);
                lfs.writeFile(TOKEN_FILE, token);
            } else {
                throw err;
            }
        }
        this.auth.setCredentials(JSON.parse(token));
        this.drive = google.drive({version: 'v3', auth});
        return true;
    }

    async getAccessToken(oAuth2Client) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        log.debug('Authorize this app by visiting this url: %s', authUrl);
        /*const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        let p = new Promise((resolve, reject) => {
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                resolve(code);
            });
        });
        let code = await p; */
let code = '4/jwHmg1iXaHLGYu2h6TkA3zPeqNQCX5SSt7Gmzwtv1da2__96zxHTBSY';
        let p = new Promise((resolve, reject) => {
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });
        return await p;
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
            file.fs = FileSystem.GoogleDrive;
            file.id = f.id;
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
