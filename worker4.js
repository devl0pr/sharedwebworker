const portsByKey = [];

onconnect = (e) => {
    const port = e.ports[0];

    console.log(port);

    port.onmessage = (e) => {
        const { type, key } = e.data;

        if (type === 'connect') {
            // Store the port with the associated key
            portsByKey[key] = port;
            console.log(`Tab connected with key: ${key}`);
        } else if (type === 'disconnect') {
            // Remove the port associated with the key
            if (portsByKey[key]) {
                delete portsByKey[key];
                console.log(`Tab disconnected with key: ${key}`);
            }
        } else if (type === 'message') {
            const message = e.data.message;

            for (const storedKey in portsByKey) {
                portsByKey[storedKey].postMessage({ message });
                console.log(portsByKey[storedKey]);
            }
        }
    };

    // port.start();
};



// onconnect = (e) => {
//     const port = e.ports[0];
//
//     console.log(' port:')
//     console.log(port);
//
//     // Add the port to the array of all connected ports (tabs)
//     allPorts.push(port);
//
//     // Start listening for messages from this port
//     port.onmessage = (e) => {
//         const workerResult = `Result: ${e.data}`;
//
//         // Send the result to all connected ports (tabs)
//         allPorts.forEach(p => {
//             p.postMessage(workerResult);
//         });
//
//         console.log('All ports:')
//         console.log(allPorts);
//     };
//
//     // Start the port (this is required for listening)
//     port.start();
// };
