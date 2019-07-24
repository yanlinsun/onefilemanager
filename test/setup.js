global.ofmconfig = {};

function MockCurrentTab() {
    this.filenames = null;
    this.cleared = false;
    this.filtered = null;
}

MockCurrentTab.prototype.getFilenames = function() {
    return this.filenames;
}

MockCurrentTab.prototype.filter = function(files) {
    this.filtered = files.slice();
}

MockCurrentTab.prototype.clearFilter = function() {
    this.cleared = true;
}

global.currentTab = new MockCurrentTab();
