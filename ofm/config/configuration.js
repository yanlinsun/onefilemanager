'use strict';
const fs = require('fs');
const toml = require('toml');
const merge = require('merge-anything');
const Default = require('./Default.js');


class Configuration {
    constructor() {
    }

    static load() {
        let file = fs.readFileSync('./config/default.toml');
        let config = toml.parse(file);
        config = merge.merge(config, Default);
        return config;
    }
    
    static save() {
        let config = window.ofmconfig;
        // TODO save
    }
}

module.exports = Configuration;
