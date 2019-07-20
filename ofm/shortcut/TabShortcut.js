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
        let opsite = opsiteTab;
        opsiteTab = currentTab;
        currentTab = opsite;
        opsiteTab.blur();
        currentTab.focus();
    }
}

module.exports = TabShortcut;
