
const path = require('path');
const sprintf = require('sprintf-js').sprintf;

const setting = {
    level : 0,
    file : null
};

const levels = [ "none", "info", "error", "warning", "verbose", "debug" ];

function init() {
    if (ofmconfig.Trace) {
        if (ofmconfig.Trace.File && ofmconfig.Trace.File != "") {
            let file = ofmconfig.Trace.File;
            if (file.indexOf("%APP_DIR%") != -1) {
                file = file.replace("%APP_DIR%", '.');
                file = path.resolve(file);
            }
            console.log("Log file: " + file);
            setting.file = file;
        }
        if (ofmconfig.Trace.Level) {
            console.log("Log level: " + ofmconfig.Trace.Level);
            setting.level = levels.indexOf(ofmconfig.Trace.Level.toLowerCase());
        }
    }
}

function log(level, msg, caller, ...args) {
    if (setting.level < level) {
        return;
    }
    if (typeof(msg) != "string") { // instanceof not safe
        args = [ msg.name, ...args, msg ];
        msg = "%s";
    }
    let d = new Date();
    let s = sprintf("%i-%i-%i %i:%i:%i.%i %s> " + msg, 
        d.getFullYear(), d.getMonth() + 1, d.getDay(), 
        d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds(), 
        (caller ? caller.name : ""),
        ...args);
    printToConsole(level, s, objArgs(...args));
    if (setting.file) {
        saveToFile(s, setting.file);
    }
}

function printToConsole(level, s, ...oArgs) {
    if (oArgs.length > 0) {
        if (level === 2) {
            console.group(s);
        } else {
            console.groupCollapsed(s);
        }
    }
    switch (level) {
        case 2:
            console.error(s);
            break;
        case 3:
            console.warning(s);
            break;
        case 1:
            console.info(s);
            break;
        default:
            console.log(s);
            break;
    }
    if (oArgs.length > 0) {
        for (let arg of oArgs.values()) {
            consoleLogArg(arg);
        }
        console.groupEnd(s);
    }
}

const objs = ["object", "function", "array", "error"];

function objArgs(...args) {
    return args.map(o => {
        if (o && objs.indexOf(typeof(o)) !== -1) {
            return o;
        }
    });
}

function consoleLogArg(arg) {
    if (arg instanceof Node) {
        console.dirxml(arg);
    } else if (arg instanceof Array) {
        console.table(arg);
    } else if (arg instanceof Error) {
        console.error(arg);
    } else if (arg instanceof Function) {
        console.log("function " + arg.name + "(...)");
    } else if (arg instanceof Object) {
        console.dir(arg);
    } else {
        console.log(arg);
    }
}

function saveToFile(s, file) {
}

function debug(msg, ...args) {
    log(5, msg, debug.caller, ...args);
}

function error(msg, ...args) {
    log(2, msg, error.caller, ...args);
}

function warning(msg, ...args) {
    log(3, msg, warning.caller, ...args);
}

function warn(msg, ...args) {
    log(3, msg, warn.caller, ...args);
}

function info(msg, ...args) {
    log(1, msg, info.caller, ...args);
}

function verbose(msg, ...args) {
    log(4, msg, verbose.caller, ...args);
}

module.exports = { init, debug, error, warning, info, verbose, warn };
