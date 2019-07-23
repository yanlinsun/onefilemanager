'use strict';
const fs = require('fs');
const toml = require('toml');
const Default = require('./Default.js');
const log = require('../trace/Log.js');
const Util = require('../util/Util.js');


class Configuration {
    constructor() {
    }

    static load() {
        let f = './config/default.toml';
        log.debug("Conf.load enter");
        log.info("Configuration using [%s]", f);
        let file = fs.readFileSync(f);
        let config = toml.parse(file);
        log.debug("---- loaded config ----");
        log.debug(config);
        log.debug("-----------------------");
        config = Util.merge(Default, config);
        log.debug("---- returned config ----");
        log.debug(config);
        log.debug("-------------------------");
        return config;
    }
    
    static save() {
        let config = window.ofmconfig;
        // TODO save
    }
}

module.exports = Configuration;
