'use strict';

class CloudProvider {
    constructor() {
        this.connected = false;
        this.connection = new Promise(async (resolve, reject) => {
            try {
                await this.connect();
                this.connected = true;
            } catch (err) {
                reject(err);
            }
        });
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
