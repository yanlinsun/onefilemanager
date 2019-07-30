
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
            if (typeof(file) == "string") {
                if (file.indexOf("%APP_DIR%") != -1) {
                    file = file.replace("%APP_DIR%", '.');
                    file = path.resolve(file);
                }
                setting.file = file;
            } else {
                error("Config [Trace.File] is not a string");
            }
        }
        if (ofmconfig.Trace.Level) {
            setting.level = levels.indexOf(ofmconfig.Trace.Level.toLowerCase());
            if (setting.level === -1) {
                setting.level = 0;
            }
        }
        info("Log initialized: file [%s], level [%s]", setting.file, levels[setting.level]);
    }
}

/**
 * return formated string for testing
 */
function log(level, msg, ...args) {
    if (setting.level < level) {
        return null;
    }
    let d = new Date();
    if (typeof(msg) !== "string" && !(msg instanceof Error)) {
        return consoleLogObj(msg);
    } else {
        let s = sprintf("%i-%02i-%02i %02i:%02i:%02i.%03i > " + msg, 
            d.getFullYear(), d.getMonth() + 1, d.getDay(), 
            d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds(), 
            ...args);
        printToConsole(level, s);
        if (setting.file) {
            saveToFile(s, setting.file);
        }
        return s;
    }
}

function printToConsole(level, s) {
    switch (level) {
        case 2:
            console.error(s);
            break;
        case 3:
            console.warn(s);
            break;
        case 1:
            console.info(s);
            break;
        default:
            console.log(s);
            break;
    }
}

function consoleLogObj(arg) {
    if (arg instanceof Node) {
        console.dirxml(arg);
        console.trace();
        return arg.outerHTML;
    } else if (arg instanceof Array) {
        console.table(arg);
        console.trace();
        return arg.toString();
    } else if (arg instanceof Error) {
        console.error(arg);
        return arg.toString();
    } else if (arg instanceof Function) {
        console.log("function " + arg.name + "(...)");
        console.trace();
        return "function " + arg.name + "(...)";
    } else if (arg instanceof Object) {
        console.dir(arg);
        console.trace();
        return arg.toString();
    } else {
        console.log(arg);
        console.trace();
        return arg.toString();
    }
}

function saveToFile(s, file) {
}

function debug(msg, ...args) {
    return log(5, msg, ...args);
}

function error(msg, ...args) {
    return log(2, msg, ...args);
}

function warning(msg, ...args) {
    return log(3, msg, ...args);
}

function warn(msg, ...args) {
    return log(3, msg, ...args);
}

function info(msg, ...args) {
    return log(1, msg, ...args);
}

function verbose(msg, ...args) {
    return log(4, msg, ...args);
}

function toUser(msg, ...args) {
    return log(0, msg, ...args);
}

function printf(msg, ...args) {
    return sprintf(msg, ...args);
}

module.exports = { init, debug, error, warning, info, verbose, warn, toUser, printf,
    // for testing only
    setting };
