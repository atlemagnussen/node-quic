const quic = require("net");
const { createQuicSocket } = require('net');
const fs = require("fs");

const key  = fs.readFileSync('./ssl_certs/server.key');
const cert = fs.readFileSync('./ssl_certs/server.crt');
const ca   = fs.readFileSync('./ssl_certs/server.csr');
const port = 3000;

console.log("start");
const server = createQuicSocket({ endpoint: { port } });
server.listen({ key, cert, alpn: 'hello' });

console.log("now session handler");

server.on('ready', () => {
    console.log("QUIC server is listening");
    console.log(`On port ${server.address.port}`);
});

server.on("session", session => {
    console.log("on session");
    session.on("stream", (stream) => {
        console.log("on stream");
        stream('initialHeaders', (headers) => {
            console.log("on headers");
            console.log(headers);
            if (headers[":path"] === "/") 
            stream.respondWithFile("./files/index.html");
            else {
                const re = /\/(\w+)*/;
                const filename = headers[":path"].replace(re, "$1");
                stream.respondWithFile(`./files/${filename}`);
            }
        });
    });
});
