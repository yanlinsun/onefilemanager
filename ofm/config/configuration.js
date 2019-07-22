'use strict';
const fs = require('fs');
const toml = require('toml');
const Default = require('./Default.js');
const log = require('electron-log');
const Util = require('../util/Util.js');


class Configuration {
    constructor() {
    }

    static load() {
        let f = './config/default.toml';
        log.debug("Conf.load enter");
        log.info("Configuration using [" + f + "]");
        let file = fs.readFileSync(f);
        let config = toml.parse(file);
        log.debug("---- loaded config ----");
        log.debug(JSON.stringify(config));
        log.debug("-----------------------");
        config = Util.merge(Default, config);
        log.debug("---- returned config ----");
        log.debug(JSON.stringify(config));
        log.debug("-------------------------");
        log.debug("Conf.load exit");
        return config;
    }
    
    static save() {
        let config = window.ofmconfig;
        // TODO save
    }
}

module.exports = Configuration;
