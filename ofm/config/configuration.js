'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const toml = require('toml');
const merge = require('merge-anything');

const homedir = os.homedir();

const Default = {
    General : {
        ShowHidden : false,
    },

    Tabs : {
        Left : [ homedir ],
        Right : [ homedir ],
        Active : {
            Left: homedir,
            Right: homedir
        }
    }
}

class Configuration {
    constructor() {
    }

    static load() {
        let file = fs.readFileSync('./config/default.toml');
        let config = toml.parse(file);
        config = merge.merge(config, Default);
        console.log(JSON.stringify(config));
        return config;
    }
    
    static save() {
        let config = window.ofmconfig;
        // TODO save
    }
}

module.exports = Configuration;
