# nodejs quic

--experimental-quic

docker build -t atlemagnussen/node-quic .

docker run -it -v $PWD:/test atlemagnussen/node-quic bash

https://web.dev/quictransport/#datagram

chromium  --origin-to-force-quic-on=localhost:4433 --ignore-certificate-errors-spki-list=B8MaS+XW9OKkSzCnwYdJIxZgHTzF24qYou/FS+EW1rE=

or chrome://flags/#allow-insecure-localhost