const expect = require('chai').expect;

const QuickSearch = require('../../ofm/shortcut/QuickSearch.js');


suite('QuickSearch', function() {
    suite('#quickSearch()', function() {

        suiteSetup(function() {
        });

        setup(function() {
            this.r = (ary, fn) => {
                this.keyArray = ary;
                this.fn = fn;
            }
            this.qs = new QuickSearch(this.r);
        });

        test('constructor', function() {
            expect(this.keyArray).to.be.a("array").that.to.have.lengthOf(36);
        });

        test('quickSearch', function() {
            currentTab.filenames = [
                "xxxxxxxxxx",
                "0123xxxxxx",
                "x0123xxxxx",
                "xx01xxxxxx",
                "xxx0xxxxxx",
                "xxxx23xxxx",
                "xxxxx3xxxx",
                "x01xxx0123",
                "xxxxxxxx01",
                "xxxxxxxxxx"
            ];

            this.qs.notimeout = true;
            this.qs.quickSearch("0");
            expect(currentTab.filtered).to.have.lengthOf(6)
            .that.to.include("0123xxxxxx")
            .that.to.include("x0123xxxxx")
            .that.to.include("xx01xxxxxx")
            .that.to.include("xxx0xxxxxx")
            .that.to.include("x01xxx0123")
            .that.to.include("xxxxxxxx01");
            this.qs.quickSearch("1");
            expect(this.qs.keys).to.include("0")
                .that.to.include("1");
            expect(currentTab.filtered).to.have.lengthOf(5)
            .that.to.include("0123xxxxxx")
            .that.to.include("x0123xxxxx")
            .that.to.include("xx01xxxxxx")
            .that.to.include("x01xxx0123")
            .that.to.include("xxxxxxxx01");
            this.qs.quickSearch("2");
            expect(currentTab.filtered).to.have.lengthOf(3)
            .that.to.include("0123xxxxxx")
            .that.to.include("x0123xxxxx")
            .that.to.include("x01xxx0123");
            this.qs.quickSearch("3");
            expect(currentTab.filtered).to.have.lengthOf(3)
            .that.to.include("0123xxxxxx")
            .that.to.include("x0123xxxxx")
            .that.to.include("x01xxx0123");
            this.qs.quickSearch("Backspace");
            expect(currentTab.filtered).to.have.lengthOf(3)
            .that.to.include("0123xxxxxx")
            .that.to.include("x0123xxxxx")
            .that.to.include("x01xxx0123");
            this.qs.quickSearch("Backspace");
            expect(currentTab.filtered).to.have.lengthOf(5)
            .that.to.include("0123xxxxxx")
            .that.to.include("x0123xxxxx")
            .that.to.include("xx01xxxxxx")
            .that.to.include("x01xxx0123")
            .that.to.include("xxxxxxxx01");
            this.qs.quickSearch("Backspace");
            expect(currentTab.filtered).to.have.lengthOf(6)
            .that.to.include("0123xxxxxx")
            .that.to.include("x0123xxxxx")
            .that.to.include("xx01xxxxxx")
            .that.to.include("xxx0xxxxxx")
            .that.to.include("x01xxx0123")
            .that.to.include("xxxxxxxx01");
            this.qs.quickSearch("Backspace");
            expect(currentTab.filtered).to.have.lengthOf(10);
        });

        test('quickSearch ignore case', function() {
            currentTab.filenames = [
                "Abcdefg",
                "defg",
                "Cdefg",
                "CDefg",
                "cdefg",
                "ABCDEFG"
            ];

            this.qs.notimeout = true;
            this.qs.quickSearch("A");
            this.qs.quickSearch("b");
            expect(currentTab.filtered).to.have.lengthOf(2)
            .that.to.include("Abcdefg")
            .that.to.include("ABCDEFG");
        });

        test('quickSearch invalid input', function() {
            currentTab.filenames = [
                "Abcdefg",
                "defg",
                "Cdefg",
                "CDefg",
                "cdefg",
                "ABCDEFG"
            ];

            this.qs.notimeout = true;
            this.qs.quickSearch("x");
            expect(this.qs.keys).to.be.a("array").that.to.have.lengthOf(0);
            this.qs.quickSearch("a");
            expect(this.qs.keys).to.be.a("array").that.to.have.lengthOf(1)
                .that.to.include("a")
                .that.to.not.include("x");
            this.qs.quickSearch("b");
            expect(this.qs.keys).to.be.a("array").that.to.have.lengthOf(2)
                .that.to.include("a")
                .that.to.include("b")
                .that.to.not.include("x");
            this.qs.quickSearch("x");
            this.qs.quickSearch("y");
            expect(this.qs.keys).to.be.a("array").that.to.have.lengthOf(2)
                .that.to.include("a")
                .that.to.include("b")
                .that.to.not.include("x")
                .that.to.not.include("y");
            expect(currentTab.filtered).to.be.a("array").that.to.have.lengthOf(2)
                .that.to.include("Abcdefg")
                .that.to.include("ABCDEFG");
        });

    });
});

