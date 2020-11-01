
let transport;
let logEl, urlEl;
let currentTransportDatagramWriter;
let streamNumber = 0;
let btnConnect;
let btnSend;
let dataTx;

let startTime;

import { utcNow } from "./dateStuff.js";

const init = () => {
    btnConnect = document.querySelector("#connect");
    btnConnect.addEventListener("click", () => connect() );
    btnSend = document.querySelector("#send");
    btnSend.addEventListener("click", () => sendData() );
    dataTx = document.querySelector("#send");
    logEl = document.getElementById('event-log');
    urlEl = document.getElementById('url');
};

const addToEventLog = (text, severity = 'info') => {
    let mostRecentEntry = logEl.lastElementChild;
    let entry = document.createElement('li');
    entry.innerText = text;
    entry.className = 'log-' + severity;
    logEl.appendChild(entry);

    if (mostRecentEntry != null &&
        mostRecentEntry.getBoundingClientRect().top <
        logEl.getBoundingClientRect().bottom) {
        entry.scrollIntoView();
    }
}

const setDisabledBtn = (connected) => {
    if (connected) {
        btnConnect.disabled = true;
        btnSend.disabled = false;
    } else {
        btnConnect.disabled = false;
        btnSend.disabled = true;
    }
}

// "Connect" button handler.
const connect = async () => {
    let url = urlEl.value;
    try {
        transport = new QuicTransport(url);
        addToEventLog('Initiating connection...');
    } catch (err) {
        addToEventLog('Failed to create connection object. ' + err, 'error');
        return;
    }

    try {
        await transport.ready;
        addToEventLog('Connection ready.');
        setDisabledBtn(true);
    } catch (err) {
        addToEventLog('Connection failed. ' + err, 'error');
        setDisabledBtn(false);
        return;
    }

    transport.closed
        .then(() => {
            addToEventLog('Connection closed normally.');
            setDisabledBtn(false);
        })
        .catch(() => {
            addToEventLog('Connection closed abruptly.', 'error');
            setDisabledBtn(false);
        });

    currentTransportDatagramWriter = transport.sendDatagrams().getWriter();
    streamNumber = 1;

    readDatagrams(transport);
    acceptUnidirectionalStreams(transport);
}

const sendData = async () => {
    let form = document.forms.sending.elements;
    let encoder = new TextEncoder('utf-8');
    let rawData = sending.data.value;
    let data = encoder.encode(rawData);
    startTime = utcNow();
    try {
        switch (form.sendtype.value) {
            case 'datagram':
                await currentTransportDatagramWriter.write(data);
                addToEventLog('Sent datagram: ' + rawData);
                break;
            case 'unidi': {
                let stream = await transport.createSendStream();
                let writer = stream.writable.getWriter();
                await writer.write(data);
                await writer.close();
                addToEventLog('Sent a unidirectional stream with data: ' + rawData);
                break;
            }
            case 'bidi': {
                let stream = await transport.createBidirectionalStream();
                let number = streamNumber++;
                readFromIncomingStream(stream, number);

                let writer = stream.writable.getWriter();
                await writer.write(data);
                await writer.close();
                addToEventLog(
                    'Opened bidirectional stream #' + number +
                    ' with data: ' + rawData);
                break;
            }
        }
    } catch (err) {
        addToEventLog('Error while sending data: ' + err, 'error');
    }
};

// Reads datagrams from |transport| into the event log until EOF is reached.
const readDatagrams = async (transport) => {
    let reader = transport.receiveDatagrams().getReader();
    let decoder = new TextDecoder('utf-8');
    try {
        while (true) {
            let result = await reader.read();
            if (result.done) {
                addToEventLog('Done reading datagrams!');
                return;
            }
            let data = decoder.decode(result.value);
            addToEventLog('Datagram received: ' + data);
        }
    } catch (err) {
        addToEventLog('Error while reading datagrams: ' + err, 'error');
    }
}

const acceptUnidirectionalStreams = async (transport) => {
    let reader = transport.receiveStreams().getReader();
    try {
        while (true) {
            let result = await reader.read();
            if (result.done) {
                addToEventLog('Done accepting unidirectional streams!');
                return;
            }
            let stream = result.value;
            let number = streamNumber++;
            addToEventLog('New incoming unidirectional stream #' + number);
            readFromIncomingStream(stream, number);
        }
    } catch (err) {
        addToEventLog('Error while accepting streams: ' + err, 'error');
    }
};

const readFromIncomingStream = async (stream, number) => {
    let decoder = new TextDecoderStream('utf-8');
    let reader = stream.readable.pipeThrough(decoder).getReader();
    try {
        while (true) {
            let result = await reader.read();
            if (result.done) {
                addToEventLog('Stream #' + number + ' closed');
                return;
            }
            let data = result.value;
            let endTime = utcNow();
            let timeDiff = endTime - startTime;
            addToEventLog(`Received data on stream #${number}: ${data}, diff: ${timeDiff}`);
        }
    } catch (err) {
        addToEventLog(
            'Error while reading from stream #' + number + ': ' + err, 'error');
    }
};

export default {init};