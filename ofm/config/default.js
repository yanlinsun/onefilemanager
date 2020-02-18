'use strict';

const os = require('os');

const Default = {
    General : {
    },

    View: {
        ShowHidden: false,
    },

    Folder: {
        MixWithFile: false,
        SortWithFile: false,
        SortMethod: "Name"
    },

    Tabs : {
        Left : [ ],
        Right : [ ],
        Active : {
            Left: null,
            Right: null
        }
    },

    GoogleDrive: {
        CredentialFile : 'googledrive.credential.json'
    },

    KeyMapping : {
        File : {
            Copy : "F5",
            Move : "F6",
            CreateFolder : "F7",
            CreateFile : "Shift+F7",
            Edit : "F4",
            CopyToClipboard : "CommandOrControl+C",
            PasteFromClipboard : "CommandOrControl+V",
            SelectAll : "CommandOrControl+A",
            Select : "Space",
            Delete : "Delete",
            DeletePermanently : "Shift+Delete",
            Open : "Enter",
        },
        
        Navigation : {
            ParentFolder : "Backspace",
            Up : "Up",
            Down : "Down",
            Left : "Left",
            Right : "Right",
            PageUp : "PageUp",
            PageDown : "PageDown",
            Top : "Home",
            End : "End",
            HomeDir : "CommandOrControl+H",
            Refresh : "CommandOrControl+R"
        },

        Tab : {
            CloseTab : "CommandOrControl+W",
            NewTab : "CommandOrControl+T",
            SwitchTab : "Tab",
            NextTab : "Control+]",
            PreviousTab : "Control+["
        },

        App : {
            Minimize : "Alt+M",
            FullScreen : "Control+F",
            Configuration : "CommandOrAlt+,",
            Quit : [ "CommandOrControl+Q" ]
        }
    },

    QuickSearch : {
        ResetMethod : 0,
        Timeout : 2000
    }
};

module.exports = Default;
