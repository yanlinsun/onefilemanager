'use strict';

// file extension to icon mapping
const ExtFileType = {
    "mp4" : "video",
    "mkv" : "video",
    "mpg" : "video",
    "mpeg" : "video",
    "flv" : "video",
    "mov" : "video",
    "mpeg" : "video",
    "mpeg" : "video",
    "mpeg" : "video",
    "mpeg" : "video",
    "wmv" : "video",

    "mp3" : "audio",
    "wav" : "audio",
    "ogg" : "hq_audio",
    "flac" : "hq_audio",
    "wma" : "audio",

    "jpg" : "image",
    "jpeg" : "image",
    "png" : "image",
    "gif" : "image",
    "tiff" : "image",
    "tif" : "image",
    "psd" : "image",
    "bmp" : "image",

    "pdf" : "pdf"
}

const TypeIcon = {
    "video" : "theaters",
    "audio" : "music_note",
    "deny"  : "block",
    "image" : "image",
    "folder" : "folder",
    "pdf" : "picture_as_pdf",
    "default" : "insert_drive_file"
}

module.exports = { ExtFileType, TypeIcon };
