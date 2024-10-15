importScripts("https://cdn.socket.io/4.7.5/socket.io.min.js");

const portsByKey = [];
let socket = null;
let init = null;

onconnect = (e) => {
    const port = e.ports[0];
    port.onmessage = (e) => {
        let connectionCount = getConnectionCount(portsByKey);

        if ( connectionCount === 0 ) {
            console.log('connection....');
            socket = io('http://localhost:3000/');
        }

        if ( socket && !init ) {
            init = true;
            socket.on('message', (msg) => {
                console.log("BROOOO 2");
                for (const storedKey in portsByKey) {
                    portsByKey[storedKey].postMessage({ message: msg });
                }
            });
        }

        const { type, key } = e.data;

        if (type === 'connect') {
            // Store the port with the associated key
            portsByKey[key] = port;

            let connectionCount = getConnectionCount(portsByKey);

            portsByKey[key].postMessage({ type: 'connect', connectionCount: connectionCount });

            console.log(`Tab connected with key: ${key}`);


            console.log(`Connection count: ${connectionCount}`);

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

function getConnectionCount(portsByKey) {
    let i = 0;

    for (const storedKey in portsByKey) {
        i++;
    }

    return i;
}