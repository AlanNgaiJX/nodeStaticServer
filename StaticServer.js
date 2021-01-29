const http = require("http");
const path = require("path");
const fs = require("fs");
const url = require("url");
const config = require("./config/default.json");
const { getMimeType } = require("./mime.js");

class StaticServer {
    constructor() {
        this.port = config.port;
        this.root = config.root;
        this.indexPage = config.indexPage;
    }

    respondNotFount(req, res) {
        res.writeHead(404, {
            "Content-Type": "text/html",
        });
        res.end(
            `<h1>Not Found</h1><p>The requested URL ${req.url} was not found on this server.</p>`
        );
    }

    respondFile(pathName, req, res) {
        const readStream = fs.createReadStream(pathName);
        res.setHeader("Content-Type", getMimeType(pathName));
        readStream.pipe(res);
    }

    respondDir(pathName, req, res) {
        fs.promises
            .readdir(pathName)
            .then((files) => {
                const reqPath = url.parse(req.url).pathname;
                let content = `<h1>Index of ${reqPath}</h1>`;

                files.forEach((file) => {
                    let itemLink = path.join(reqPath, file);
                    const stat = fs.statSync(path.join(pathName, file));
                    if (stat && stat.isDirectory()) {
                        itemLink = path.join(itemLink, "/");
                    }
                    content += `<p><a href='${itemLink}'>${file}</a></p>`;
                });

                res.writeHead(200, {
                    "Content-Type": "text/html",
                });

                res.end(content);
            })
            .catch((err) => {
                res.writeHead(500);
                return res.end(err);
            });
    }

    respondRedirect(pathName, req, res) {
        const location = req.url + "/";
        res.writeHead(301, {
            Location: location,
            "Content-Type": "text/html",
        });
        res.end(`Redirecting to <a href='${location}'>${location}</a>`);
    }

    routeHandler(pathName, req, res) {
        fs.promises.stat(pathName).then(
            (stat) => {
                const reqPath = url.parse(req.url).pathname;
                if (/\/$/.test(reqPath) && stat.isDirectory()) {
                    this.respondDir(pathName, req, res);
                } else if (stat.isDirectory()) {
                    this.respondRedirect(pathName, req, res);
                } else {
                    this.respondFile(pathName, req, res);
                }
            },
            () => {
                this.respondNotFount(req, res);
            }
        );
    }

    start() {
        http.createServer((req, res) => {
            const pathName = path.join(this.root, path.normalize(req.url));
            console.log(`Requeste path: ${pathName}`);
            this.routeHandler(pathName, req, res);
        }).listen(this.port, (err) => {
            if (err) {
                console.warn(err);
                console.warn("Failed to start static server");
            } else {
                console.log(`Static server started on port ${this.port}`);
            }
        });
    }
}

module.exports = StaticServer;
