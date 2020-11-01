# nodejs quic

--experimental-quic

docker build -t atlemagnussen/node-quic .

docker run -it -v $PWD:/test atlemagnussen/node-quic bash

## python test from google
https://web.dev/quictransport/#datagram

Before server can be started run `create-keys.sh`
Then run `get-fingerprint.sh` to get the finterprint and tell chromium to ignore cert error for:

```sh
chromium  --origin-to-force-quic-on=localhost:4433 --ignore-certificate-errors-spki-list=B8MaS+XW9OKkSzCnwYdJIxZgHTzF24qYou/FS+EW1rE= # the latter is the finterprint
```
dont know if this wors: chrome://flags/#allow-insecure-localhost