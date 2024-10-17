importScripts("https://cdn.socket.io/4.7.5/socket.io.min.js");

const portsByKey = [];
let socket = null;
let init = null;

onconnect = (e) => {
    const port = e.ports[0];
    port.onmessage = (e) => {
        let connectedTabCount = getConnectedTabCount(portsByKey);

        if ( connectedTabCount === 0 ) {
            console.log('connection....');
            socket = io('http://localhost:3000/');
        }

        if ( socket && !init ) {
            init = true;
            socket.on('message', (msg) => {
                for ( const storedKey in portsByKey ) {
                    portsByKey[storedKey].postMessage({ message: msg });
                }
            });
        }

        const { type, key } = e.data;

        if (type === 'connect') {
            // Store the port with the associated key
            portsByKey[key] = port;

            portsByKey[key].postMessage({ type: 'connect', connectedTabCount: connectedTabCount });

            console.log(`Tab connected with key: ${key}`);
            console.log(`Connection count: ${connectedTabCount}`);

        } else if (type === 'disconnect') {
            // Remove the port associated with the key
            if (portsByKey[key]) {

                delete portsByKey[key];
                console.log(`Tab disconnected with key: ${key}`);
            }
        } else if (type === 'message') {
            const message = e.data.message;

            if ( socket ) {
                socket.emit('message', message);
            }
        }
    };
};

function getConnectedTabCount(portsByKey) {
    let i = 0;

    for (const storedKey in portsByKey) {
        i++;
    }

    return i;
}