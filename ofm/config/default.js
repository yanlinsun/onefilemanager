'use strict';

const os = require('os');

const homedir = os.homedir();

const Default = {
    General : {
        ShowHidden : false,
    },

    Tabs : {
        Left : [],
        Right : [],
        Active : {
            Left: null,
            Right: null
        }
    },

    KeyMapping : {
        File : {
            Copy : "F5",
            Move : "F6",
            CreateFolder : "F7",
            CreateFile : "Shift+F7",
            Edit : "F4",
            CopyToClipboard : [ "Command+C", "Control+C" ],
            PasteFromClipboard : [ "Command+V", "Control+V" ],
            SelectAll : [ "Command+A", "Control+A" ],
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
            HomeDir : "Control+H"
        },

        Tab : {
            CloseTab : [ "Command+W", "Control+W" ],
            NewTab : [ "Command+T", "Control+T" ],
            SwitchTab : "Tab",
            NextTab : "Control+]",
            PreviousTab : "Control+["
        },

        App : {
            Minimize : "Alt+M",
            FullScreen : "Control+F",
            Configuration : [ "Command+,", "Alt+," ],
            Quit : [ "Command+Q", "Control+Q" ]
        }
    }
};

module.exports = Default;
