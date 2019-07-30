'use strict';

class CloudProvider {
    constructor(fsname) {
        this.name = fsname;
        this.connection = this.connect();
    }
    
    /**
     * https://accounts.google.com/o/oauth2/approval/v2/approvalnativeapp?
     * auto=false&response=
     * code%3D4%2FjwHJjCMYtw9K_GXxFAxsD3Xz5VnenPqD2m9p_8eZPXbYKe6PTpbCfP4
     * %26scope%3Dhttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly
     * &approvalCode=4%2FjwHJjCMYtw9K_GXxFAxsD3Xz5VnenPqD2m9p_8eZPXbYKe6PTpbCfP4o
     * 
     */
    handleOAuthUrl(url, win, resolve, reject) {
        let l = decodeURIComponent(url);
        var raw_code = /approvalCode=([^&]*)/.exec(l) || null;
        var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
        var error = /\?error=(.+)$/.exec(l);

        if (code || error) {
            win.close();
            if (error) {
                reject(new Error(error));
            } else if (code) {
                code = decodeURI(code);
                resolve(code);
            }
        }
    }

    /**
     * Describe the provide's general properties
     * return object - Cloud Properties
     *
     * Properties:
     *   pingInterval - To keep connection alive, send ping message
     *   pingable - Wheather support ping
     *   maxSingleFileSize - Max size of a single file, unit byte
     *   maxFilenameLength - Max characters allowd in file name
     *   invalidFilenameChars - string. chars which is invlid in filename
     */
    getProperty() {
        throw new Error("Method should be implement by subclass");
    }

    /**
     * Describe user specific properties
     * return object - User properties
     *
     * Properties:
     *   capacity - Volume, unit byte
     *   occupied - Occupied capacity, unit byte
     *   ofminitialized - boolean. wheather ofm is initialized on this provider
     *   ofmroot - path of ofm root folder
     */
    async getUserProperty() {
        throw new Error("Method should be implement by subclass");
    }

    /**
     * connect to the cloud provider, login.
     */
    async connect(...params) {
        throw new Error("Method should be implement by subclass");
    }

    /**
     * disconnect from the cloud provider, logout.
     */
    async disconnect(...params) {
        throw new Error("Method should be implement by subclass");
    }

    async getFile(fullpath) {
        throw new Error("Method should be implement by subclass");
    }

    /**
     * List directory return files' names
     * returns string array Filename e.g OneFile.txt
     */
    async listDir(fullpath) {
        throw new Error("Method should be implement by subclass");
    }

    /**
     * get file content
     * return byte array File content
     */
    async download(fullpath) {
        throw new Error("Method should be implement by subclass");
    }


    /**
     * upload file to cloud
     * buffer - byte array
     */
    async upload(fullpath, buffer) {
        throw new Error("Method should be implement by subclass");
    }
}

module.exports = CloudProvider;
