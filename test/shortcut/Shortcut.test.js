const expect = require('chai').expect;
const testhelper = require("../spectron-helper");
const app = testhelper.initialiseSpectron();
const Shortcut = require('../../ofm/shortcut/Shortcut.js');

suite('Shortcut', function() {
    suite('#translate()', function() {

        suiteSetup(function() {
            return app.start();      
        });

        setup(function() {
        });

        suiteTeardown(function() {
            if (app && app.isRunning()) {
                return app.stop();
            }
        });

        test('Control+H should be ctrl+h', function() {
            let k1 = "Control+H";
            let k2 = Shortcut.translate(k1);
            expect(k2).to.equal("ctrl+h");
        });
        test('CommandOrControl+H should be ctrl+h on windows and linux', function() {
            if (process.platform === 'darwin') {
                this.skip();
            }
            let k1 = "CommandOrControl+H";
            let k2 = Shortcut.translate(k1);
            expect(k2).to.equal("ctrl+h");
        });
        test('CommandOrControl+H should be command+h on mac', function() {
            if (process.platform === 'darwin') {
                let k1 = "CommandOrControl+H";
                let k2 = Shortcut.translate(k1);
                expect(k2).to.equal("command+h");
            } else {
                this.skip();
            }
        });
        test('CommandOrAlt+H should be ctrl+h on windows and linux, command+h on mac', function() {
            let k1 = "CommandOrAlt+H";
            let k2 = Shortcut.translate(k1);
            if (process.platform === 'darwin') {
                expect(k2).to.equal("command+h");
            } else {
                expect(k2).to.equal("alt+h");
            }
        });
        test('Shift+CommandOrControl+H should be shift+ctrl+h on windows and linux, shift+command+h on mac', function() {
            let k1 = "Shift+CommandOrControl+H";
            let k2 = Shortcut.translate(k1);
            if (process.platform === 'darwin') {
                expect(k2).to.equal("shift+command+h");
            } else {
                expect(k2).to.equal("shift+ctrl+h");
            }
        });
        test('SHIFT+H should be shift+h', function() {
            let k1 = "SHIFT+H";
            let k2 = Shortcut.translate(k1);
            expect(k2).to.equal("shift+h");
        });
    });
});
