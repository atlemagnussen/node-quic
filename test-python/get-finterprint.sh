#!/usr/bin/env bash
openssl x509 -pubkey -noout -in certificate.pem |
                   openssl rsa -pubin -outform der |
                   openssl dgst -sha256 -binary | base64