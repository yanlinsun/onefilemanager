'use strict';

const TypeIcon = {
    "video" : "theaters",
    "audio" : "music_note",
    "deny"  : "block",
    "image" : "image",
    "folder" : "folder",
    "pdf" : "picture_as_pdf",
    "default" : "insert_drive_file"
}

// file extension to icon mapping
const All = {
    "Directory" : { description : "Directory", icon : TypeIcon.folder },
    "ParentFolder" : { description : "Parent Folder", icon : TypeIcon.folder },
    "File" : { description : "File", icon : TypeIcon.default },
    // video
    "mp4" : { description : "MP4 Video", icon : TypeIcon.video },
    "mkv" : { description : "MKV Video", icon : TypeIcon.video },
    "mpg" : { description : "MPG Video", icon : TypeIcon.video },
    "mpeg" : { description : "MPEG Video", icon : TypeIcon.video },
    "flv" : { description : "FLV Video", icon : TypeIcon.video },
    "mov" : { description : "MOV Video", icon : TypeIcon.video },
    "wmv" : { description : "Windows Media Video", icon : TypeIcon.video },

    // audio
    "mp3" : { description : "MP3 Audio", icon : TypeIcon.audio },
    "wav" : { description : "WAV Audio", icon : TypeIcon.audio },
    "ogg" : { description : "OGG Lossless Audio", icon : TypeIcon.audio },
    "flac" : { description : "FLAC Lossless Audio", icon : TypeIcon.audio },
    "wma" : { description : "Windows Media Audio", icon : TypeIcon.audio },

    // picture
    "jpg" : { description : "JPG Image", icon : TypeIcon.image },
    "jpeg" : { description : "JPEG Image", icon : TypeIcon.image },
    "png" : { description : "PNG Image", icon : TypeIcon.image },
    "gif" : { description : "GIF Animation", icon : TypeIcon.image },
    "tiff" : { description : "TIFF Image", icon : TypeIcon.image },
    "tif" : { description : "TIF Image", icon : TypeIcon.image },
    "psd" : { description : "Photoshop Image", icon : TypeIcon.image },
    "bmp" : { description : "Bitmap Image", icon : TypeIcon.image },

    // network
    "pdf" : { description : "Portable Document", icon : TypeIcon.default },
    "html" : { description : "HTML File", icon : TypeIcon.default },
    "htm" : { description : "HTM File", icon : TypeIcon.default },
    "xml" : { description : "XML File", icon : TypeIcon.default },

    // programming
    "md" : { description : "Mark Down File", icon : TypeIcon.default },
    "js" : { description : "JavaScript File", icon : TypeIcon.default },
    "ts" : { description : "TypeScript File", icon : TypeIcon.default },
    "mjs" : { description : "JavaScript Module", icon : TypeIcon.default },
    "xsjs" : { description : "SAP HANA XSJS File", icon : TypeIcon.default },
    "java" : { description : "Java File", icon : TypeIcon.default },
    "c" : { description : "C File", icon : TypeIcon.default },
    "cpp" : { description : "C++ File", icon : TypeIcon.default },
    "h" : { description : "C Header File", icon : TypeIcon.default },
    "opts" : { description : "Option File", icon : TypeIcon.default },
    "toml" : { description : "TOML Configuration", icon : TypeIcon.default },
    "css" : { description : "CSS Source", icon : TypeIcon.default },

    // txt files
    "vim" : { description : "VIM File", icon : TypeIcon.default },
    "md" : { description : "Mark Down File", icon : TypeIcon.default },
    "txt" : { description : "Plain Text", icon : TypeIcon.default },

    // windows
    "cmd" : { description : "Windows Command Script", icon : TypeIcon.default },
    "bat" : { description : "Windows Batch Script", icon : TypeIcon.default },
    "dll" : { description : "Windows Dynamic Library", icon : TypeIcon.default },
    "sys" : { description : "Windows System File", icon : TypeIcon.default },

    // mac
    "app" : { description : "Mac Application", icon : TypeIcon.default },

    // others
    "map" : { description : "Map File", icon : TypeIcon.default }
}

function getFiletype(ext) {
    if (All[ext.toLowerCase()]) {
        return All[ext.toLowerCase()];
    } else {
        return All["File"];
    }
}

const Directory = All["Directory"];
const ParentFolder = All["ParentFolder"];

module.exports = { getFiletype, Directory, TypeIcon, All, ParentFolder };
