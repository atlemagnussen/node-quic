const quic = require("net");
const { createQuicSocket } = require('net');
const fs = require("fs");

const key  = fs.readFileSync('./ssl_certs/server.key');
const cert = fs.readFileSync('./ssl_certs/server.crt');
const ca   = fs.readFileSync('./ssl_certs/server.csr');

const options = {
    key,
    cert
};

const server = createQuicSocket({ port: 3000 });
server.listen(options);
server.on("session", session => {
    session.on("stream", (stream, headers) => {
        if (headers[":path"] === "/") 
            stream.respondWithFile("./files/index.html");
        else {
            const re = /\/(\w+)*/;
            const filename = headers[":path"].replace(re, "$1");
            stream.respondWithFile(`./files/${filename}`);
        }
    });
});
