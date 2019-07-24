const expect = require('chai').expect;

const log = require('../../ofm/trace/Log.js');

const path = require('path');

suite('Log', function() {
    suite('#init()', function() {

        suiteSetup(function() {
            ofmconfig = {};
        });

        setup(function() {
            ofmconfig = {
                Trace: {
                    File: null,
                    Level: "none"
                }
            }
            this.config = ofmconfig.Trace;
            log.setting.level = 0;
            log.setting.file = null;
        });

        test('normal case', function() {
            this.config.File = "a/b/c";
            this.config.Level = "Debug";
            log.init();      
            expect(log.setting.level).to.equal(5);
            expect(log.setting.file).to.equal("a/b/c");
        });
        test('file: empty string', function() {
            this.config.File = "";
            log.init();      
            expect(log.setting.file).to.equal(null);
        });
        test('file: %APP_DIR%', function() {
            this.config.File = "%APP_DIR%/a/b/c";
            log.init();      
            let appDir = path.resolve(".");
            if (process.platform === 'win32') {
                appDir = appDir + "\\a\\b\\c";
            } else {
                appDir = appDir + "/a/b/c";
            }
            expect(log.setting.file).to.equal(appDir);
        });
        test('file: non string', function() {
            this.config.File = 1;
            log.init();      
            expect(log.setting.file).to.equal(null);
            this.config.File = [ "a" ];
            log.init();      
            expect(log.setting.file).to.equal(null);
            this.config.File = { a: "b" };
            log.init();      
            expect(log.setting.file).to.equal(null);
            this.config.File = new Date();
            log.init();      
            expect(log.setting.file).to.equal(null);
        });

        test('level: lower case, all levels', function() {
            this.config.File = null;
            this.config.Level = "none";
            log.init();      
            expect(log.setting.level).to.equal(0);
            this.config.Level = "info";
            log.init();      
            expect(log.setting.level).to.equal(1);
            this.config.Level = "error";
            log.init();      
            expect(log.setting.level).to.equal(2);
            this.config.Level = "warning";
            log.init();      
            expect(log.setting.level).to.equal(3);
            this.config.Level = "verbose";
            log.init();      
            expect(log.setting.level).to.equal(4);
            this.config.Level = "debug";
            log.init();      
            expect(log.setting.level).to.equal(5);
        });

        test('level: upper case, all levels', function() {
            this.config.File = null;
            this.config.Level = "NONE";
            log.init();      
            expect(log.setting.level).to.equal(0);
            this.config.Level = "INFO";
            log.init();      
            expect(log.setting.level).to.equal(1);
            this.config.Level = "ERROR";
            log.init();      
            expect(log.setting.level).to.equal(2);
            this.config.Level = "WARNING";
            log.init();      
            expect(log.setting.level).to.equal(3);
            this.config.Level = "VERBOSE";
            log.init();      
            expect(log.setting.level).to.equal(4);
            this.config.Level = "DEBUG";
            log.init();      
            expect(log.setting.level).to.equal(5);
        });

        test('level: invalid string', function() {
            this.config.File = null;
            this.config.Level = "NOE";
            log.init();      
            expect(log.setting.level).to.equal(0);
            this.config.Level = "INiFO";
            log.init();      
            expect(log.setting.level).to.equal(0);
        });
    });

    suite('#log level effect', function() {

        suiteSetup(function() {
            ofmconfig = {};

            trim = function(s) {
                if (s) {
                    return s.substring(26);
                } else {
                    return s;
                }
            };
        });

        setup(function() {
            ofmconfig = {
                Trace: {
                    File: null,
                    Level: "none"
                }
            }
            this.config = ofmconfig.Trace;
            log.setting.level = 0;
            log.setting.file = null;
        });

        test('level: none log should be recoreded', function() {
            this.config.Level = "none";
            log.init();
            let s = log.info("test");
            expect(trim(s)).to.be.null;
            s = log.error("test");
            expect(trim(s)).to.be.null;
            s = log.warn("test");
            expect(trim(s)).to.be.null;
            s = log.warning("test");
            expect(trim(s)).to.be.null;
            s = log.verbose("test");
            expect(trim(s)).to.be.null;
            s = log.debug("test");
            expect(trim(s)).to.be.null;
            s = log.toUser("test");
            expect(trim(s)).to.equal("test");
        });

        test('level: info log should be recoreded', function() {
            this.config.Level = "info";
            log.init();
            let s = log.info("test");
            expect(trim(s)).to.be.equal("test");
            s = log.error("test");
            expect(trim(s)).to.be.null;
            s = log.warn("test");
            expect(trim(s)).to.be.null;
            s = log.warning("test");
            expect(trim(s)).to.be.null;
            s = log.verbose("test");
            expect(trim(s)).to.be.null;
            s = log.debug("test");
            expect(trim(s)).to.be.null;
            s = log.toUser("test");
            expect(trim(s)).to.equal("test");
        });

        test('level: error log should be recoreded', function() {
            this.config.Level = "error";
            log.init();
            let s = log.info("test");
            expect(trim(s)).to.be.equal("test");
            s = log.error("test");
            expect(trim(s)).to.be.equal("test");
            s = log.warn("test");
            expect(trim(s)).to.be.null;
            s = log.warning("test");
            expect(trim(s)).to.be.null;
            s = log.verbose("test");
            expect(trim(s)).to.be.null;
            s = log.debug("test");
            expect(trim(s)).to.be.null;
            s = log.toUser("test");
            expect(trim(s)).to.equal("test");
        });

        test('level: warning log should be recoreded', function() {
            this.config.Level = "warning";
            log.init();
            let s = log.info("test");
            expect(trim(s)).to.be.equal("test");
            s = log.error("test");
            expect(trim(s)).to.be.equal("test");
            s = log.warn("test");
            expect(trim(s)).to.be.equal("test");
            s = log.warning("test");
            expect(trim(s)).to.be.equal("test");
            s = log.verbose("test");
            expect(trim(s)).to.be.null;
            s = log.debug("test");
            expect(trim(s)).to.be.null;
            s = log.toUser("test");
            expect(trim(s)).to.equal("test");
        });

        test('level: verbose log should be recoreded', function() {
            this.config.Level = "verbose";
            log.init();
            let s = log.info("test");
            expect(trim(s)).to.be.equal("test");
            s = log.error("test");
            expect(trim(s)).to.be.equal("test");
            s = log.warn("test");
            expect(trim(s)).to.be.equal("test");
            s = log.warning("test");
            expect(trim(s)).to.be.equal("test");
            s = log.verbose("test");
            expect(trim(s)).to.be.equal("test");
            s = log.debug("test");
            expect(trim(s)).to.be.null;
            s = log.toUser("test");
            expect(trim(s)).to.equal("test");
        });

        test('level: debug log should be recoreded', function() {
            this.config.Level = "debug";
            log.init();
            let s = log.info("test");
            expect(trim(s)).to.be.equal("test");
            s = log.error("test");
            expect(trim(s)).to.be.equal("test");
            s = log.warn("test");
            expect(trim(s)).to.be.equal("test");
            s = log.warning("test");
            expect(trim(s)).to.be.equal("test");
            s = log.verbose("test");
            expect(trim(s)).to.be.equal("test");
            s = log.debug("test");
            expect(trim(s)).to.be.equal("test");
            s = log.toUser("test");
            expect(trim(s)).to.equal("test");
        });
    });

    suite.skip('#log obj', function() {

        suiteSetup(function() {
            ofmconfig = {
                Trace: {
                    File: null,
                    Level: "debug"
                }
            }
            
            log.init();

            trim = function(s) {
                if (s) {
                    return s.substring(26);
                } else {
                    return s;
                }
            };
        });

        test('object should print its name', function() {
            let obj = { a : "b" };
            let s = log.debug(obj);
            expect(trim(s)).to.equal('{"a":"b"}');
        });

        test('array should print its content', function() {
            let obj = [ "a", "b" ];
            let s = log.debug(obj);
            expect(trim(s)).to.equal('["a","b"]');
        });
    });

});
