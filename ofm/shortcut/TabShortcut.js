'use strict';

class TabShortcut {
    constructor(r) {
        let key = ofmconfig.KeyMapping.Tab;
        r(key.CloseTab, this.closeTab);
        r(key.NewTab, this.newTab);
        r(key.SwitchTab, this.switchTab);
        r(key.NextTab, this.nextTab);
        r(key.PreviousTab, this.previousTab);
    }

    switchTab() {
        opsiteTab.focus();
        return false;
    }
}

module.exports = TabShortcut;
