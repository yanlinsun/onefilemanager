'use strict';
const fs = require('fs');
const os = require('os');
const toml = require('toml');
const Default = require('./Default.js');
const Util = require('../util/Util.js');


class Configuration {
    constructor() {
    }

    static load() {
        let f = './config/default.toml';
        console.info("Configuration using [%s]", f);
        let config;
        try {
            let file = fs.readFileSync(f);
            config = toml.parse(file);
            console.debug("---- loaded config ----");
            console.debug(config);
            console.debug("-----------------------");
            config = Util.merge(Default, config);
            Configuration.setDefaultValue(config);
        } catch (err) {
            console.error(err);
            config = Default;
        }
        console.debug("---- returned config ----");
        console.debug(config);
        console.debug("-------------------------");
        return config;
    }
    
    static setDefaultValue(config) {
        if (config.Tabs.Left.length === 0) {
            config.Tabs.Left.push(os.homedir());
        }
        if (config.Tabs.Right.length === 0) {
            config.Tabs.Right.push(os.homedir());
        }
    }

    static save() {
        let config = window.ofmconfig;
        // TODO save
    }
}

module.exports = Configuration;
