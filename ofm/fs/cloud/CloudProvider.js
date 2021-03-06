'use strict';

class CloudProvider {
    constructor(name, provider) {
        this.providerId = provider + "-" + name;
        this.provider = provider;
        this.name = name;
        this.connection = this.connect();
    }
    
    /**
     * https://accounts.google.com/o/oauth2/approval/v2/approvalnativeapp?
     * auto=false&response=
     * code%3D4%2FjwHJjCMYtw9K_GXxFAxsD3Xz5VnenPqD2m9p_8eZPXbYKe6PTpbCfP4
     * %26scope%3Dhttps%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly
     * &approvalCode=4%2FjwHJjCMYtw9K_GXxFAxsD3Xz5VnenPqD2m9p_8eZPXbYKe6PTpbCfP4o
     *
     * http://localhost/?code=4%2FlgFnH4bmBtngbmNgfgs7GyySiBDklnn9lgU851NUypOGy8KXwueVVfYWd5F2vTe5U0TsfhvX6uvKG3r9PUVx2_s
     * &scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly#
     */
    handleOAuthUrl(url, win, resolve, reject) {
        let l = decodeURIComponent(url);
        var raw_code = /code=([^&]*)/.exec(l) || null;
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

    async reconnect() {
        this.connection = this.connect(true);
        return await this.connection;
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
        throw log.subimpl;
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
        throw log.subimpl;
    }

    /**
     * connect to the cloud provider, login.
     */
    async connect(...params) {
        throw log.subimpl;
    }

    /**
     * disconnect from the cloud provider, logout.
     */
    async disconnect(...params) {
        throw log.subimpl;
    }

    async getFile(fullpath) {
        throw log.subimpl;
    }

    /**
     * List directory return files' names
     * returns string array Filename e.g OneFile.txt
     */
    async listDir(fullpath) {
        throw log.subimpl;
    }

    /**
     * get file content
     * return byte array File content
     */
    async download(fullpath) {
        throw log.subimpl;
    }


    /**
     * upload file to cloud
     * buffer - byte array
     */
    async upload(fullpath, buffer) {
        throw new Error("Method should be implement by subclass");
        throw log.subimpl;
    }

    /**
     * Get the root directory
     * return File
     */
    rootDir() {
        throw new Error("Method should be implement by subclass");
        throw log.subimpl;
    }
}

module.exports = CloudProvider;
