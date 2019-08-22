const expect = require('chai').expect;

const WindowsRoot = require('../../../ofm/fs/root/WindowsRoot.js');

suite('WindowsRoot', function() {
    setup(function() {});

    suite('construct', function() {
        test('construct', function() {
            const root = new WindowsRoot();
        });
    });
});
