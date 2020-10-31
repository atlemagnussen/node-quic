
FROM debian:buster-slim

LABEL maintainer="Atle Magnussen <atlemagnussen@gmail.com>"

RUN apt update && \
    apt install -y software-properties-common && \
    apt update && \
    apt install -y \
      g++ \
      python \
      ccache \
      build-essential \
      git \
      python3-distutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p build && \
    cd build && \
    git clone https://github.com/nodejs/node.git && \
    cd node && \
    git checkout v15.0.1 -b bra/15.0.1 && \
    # Build Node.js with QUIC
    ./configure --experimental-quic && \
    CC='ccache gcc' CXX='ccache g++' make -j4 && \
    # Install
    make install PREFIX=/usr/local && \
    rm -rf /build

CMD [ "node" ]
