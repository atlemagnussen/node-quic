mkdir ssl_certs
cd ssl_certs
openssl genrsa 2024 > server.key
openssl req -new -key server.key -subj "/C=JP" > server.csr
openssl x509 -req -days 3650 -signkey server.key < server.csr > server.crt
cd -