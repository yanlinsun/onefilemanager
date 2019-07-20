'use strict';

const os = require('os');

const homedir = os.homedir();

const Default = {
    General : {
        ShowHidden : false,
    },

    Tabs : {
        Left : [ homedir ],
        Right : [ homedir ],
        Active : {
            Left: homedir,
            Right: homedir
        }
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
            Top : "Home",
            End : "End",
            HomeDir : "Control+H"
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
            Configuration : [ "Command+,", "Alt+," ],
            Quit : "CommandOrControl+Q"
        }
    }
};

module.exports = Default;
