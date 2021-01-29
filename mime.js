const path = require("path");

const mimeTypes = {
    css: "text/css",
    gif: "image/gif",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    png: "image/png",
    txt: "text/txt"
};

function getMimeType(pathName) {
    const ext = path.extname(pathName).split(".").pop();

    return mimeTypes[ext] || mimeTypes['txt']; 
}


module.exports = {
    getMimeType
}