// my_echo_server.js

const { createQuicSocket } = require('net');
const fs = require('fs');

const key  = fs.readFileSync('./ssl_certs/server.key');
const cert = fs.readFileSync('./ssl_certs/server.crt');
const ca   = fs.readFileSync('./ssl_certs/server.csr');
const port = 1234;

console.log("start");

// Create the QUIC UDP IPv4 socket bound to local IP port 1234
const server = createQuicSocket({ endpoint: { port } });

// Tell the socket to operate as a server using the given
// key and certificate to secure new connections, using
// the fictional 'hello' application protocol.
server.listen({ key, cert, alpn: 'hello' });

console.log("server listen");

server.on('session', (session) => {
  // The peer opened a new stream!
  session.on('stream', (stream) => {
    // Echo server
    stream.pipe(stream);
  });
});

server.on('listening', () => {
  // The socket is listening for sessions!
  console.log(`listening on ${port}...`);
  console.log('input something!');
});

const socket = createQuicSocket({
  client: {
    key,
    cert,
    ca,
    requestCert: true,
    alpn: 'hello',
    servername: 'localhost'
  }
});

(async function() {
    console.log("try connect client");
    const client = await socket.connect({
        address: 'localhost',
        port,
    });
    client.on('secure', async () => {
        console.log("client secure");
        
        const str = await client.openStream();
        
        process.stdin.pipe(str);
        
        str.on('data', (chunk) => {
            console.log(`client(on-secure): ${chunk.toString()}`);
        });
        str.on('end', () => {
            console.log('client(on-secure): end');
        });
        str.on('close', () => {
            // Graceful shutdown
            socket.close();
        });
    });
})();

