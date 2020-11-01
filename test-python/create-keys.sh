#!/usr/bin/env bash
openssl req -newkey rsa:2048 -nodes -keyout certificate.key \
                   -x509 -out certificate.pem -subj '/CN=Test Certificate' \
                   -addext "subjectAltName = DNS:localhost"

