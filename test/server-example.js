'use strict';

const key  = fs.readFileSync('./ssl_certs/server.key');
const cert = fs.readFileSync('./ssl_certs/server.crt');
const ca   = fs.readFileSync('./ssl_certs/server.csr');
const port = 3000;

const { createQuicSocket } = require('net');

const socket = createQuicSocket({ endpoint: { port } });
console.log(`socket created on port ${port}`);
socket.on('session', async (session) => {
    session.on('stream', (stream) => {
        stream.end('Hello World');
        stream.setEncoding('utf8');
        stream.on('data', console.log);
        stream.on('end', () => console.log('stream ended'));
    });

    const uni = await session.openStream({ halfOpen: true });
    uni.write('hi ');
    uni.end('from the server!');
});


(async function() {
  await socket.listen({ key, cert, alpn: 'hello' });
  console.log('The socket is listening for sessions!');
})();