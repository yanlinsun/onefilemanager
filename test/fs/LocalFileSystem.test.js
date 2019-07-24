const expect = require('chai').expect;

const LocalFileSystem = require('../../ofm/fs/LocalFileSystem.js');
const cache = require('../../ofm/fs/Cache.js');
const os = require('os');

suite('LocalFileSystem', function() {

    setup(function() {
       cache.clear();
       this.lfs = new LocalFileSystem();
    });

    suite('getHomeDir()', function() {
        test('getHomeDir', async function() {
            debugger;
            let f1 = await this.lfs.getHomeDir();
            let home = os.homedir();
            expect(f1, "f1").to.be.not.undefined;
            expect(f1.fullpath).to.equal(home);
        });
    });

    suite('cache', function() {
        test('cache', async function() {
            let f1 = await this.lfs.getHomeDir();
            let lfs2 = new LocalFileSystem();
            let f2 = await lfs2.getHomeDir();

            expect(f1, "f1").to.be.not.undefined;
            expect(f2, "f2").to.be.not.undefined;
            expect(f1, "f1 f2 should be identical").to.equal(f2);
        });

        test('clear', async function() {
            let f1 = await this.lfs.getHomeDir();
            cache.clear();
            let f2 = await this.lfs.getHomeDir();
            expect(f1, "f1").to.be.not.undefined;
            expect(f2, "f2").to.be.not.undefined;
            expect(f1, "f1 f2 should not be identical").to.not.equal(f2);
        });
    });

    suite('concurrent', function() {
        test('sequencial get', async function() {
            let f1 = await this.lfs.getHomeDir();
            let f2 = await this.lfs.getHomeDir();
            let f3 = await this.lfs.getHomeDir();
            expect(f1, "f1").to.be.not.undefined;
            expect(f2, "f2").to.be.not.undefined;
            expect(f3, "f3").to.be.not.undefined;
            expect(f1, "f1 f2 should be identical").to.equal(f2).that.to.equal(f3);
        });

        test('concurrent get', async function() {
            let f1 = this.lfs.getHomeDir();
            let f2 = this.lfs.getHomeDir();
            let f3 = this.lfs.getHomeDir();
            let o = await Promise.all([f1,f2,f3]);
            [f1,f2,f3] = [...o];
            expect(f1, "f1").to.be.not.undefined;
            expect(f2, "f2").to.be.not.undefined;
            expect(f3, "f3").to.be.not.undefined;
            expect(f1, "f1 f2 should be identical").to.equal(f2).that.to.equal(f3);
        });
    });

});
