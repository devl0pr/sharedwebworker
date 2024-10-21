importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js");

const portsByKey = [];
let db = null;
let init = null;
let usersRef = null;

onconnect = (e) => {
    const port = e.ports[0];

    port.onmessage = (e) => {

        let connectedTabCount = getConnectedTabCount(portsByKey);

        const { type, key, config, authToken, notpassed } = e.data;

        if (type === 'connect') {

            if ( connectedTabCount === 0 ) {

                console.log('initialize firebase...');
                // Initialize Firebase
                firebase.initializeApp(config);
                firebase.auth().signInWithCustomToken(authToken)
                    .then((userCredential) => {
                        // Signed in
                        var user = userCredential.user;

                        db = firebase.database();

                        if ( db && !init ) {
                            init = true;

                            usersRef = db.ref('users/2');
                            usersRef.on('value', function(snap) {
                                console.log(snap.val());
                                for ( const storedKey in portsByKey ) {
                                    portsByKey[storedKey].postMessage({ message: snap.val() });
                                }
                            });
                        }

                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // ...

                        console.log(errorCode, errorMessage);
                    });
            }

            // Store the port with the associated key
            portsByKey[key] = port;

            portsByKey[key].postMessage({ type: 'connect', connectedTabCount: connectedTabCount });

            console.log(`Tab connected with key: ${key}`);
            console.log(`Connected tab count: ${connectedTabCount}`);

        } else if (type === 'disconnect') {
            // Remove the port associated with the key
            if (portsByKey[key]) {

                delete portsByKey[key];

                firebase.auth().signOut().then(() => {
                    // Sign-out successful.
                }).catch((error) => {
                    // An error happened.
                });

                console.log(`Tab disconnected with key: ${key}`);
            }
        } else if (type === 'updateRef') {
            const params = e.data.params;

            console.log(usersRef)
            if ( usersRef ) {
                // usersRef.set(params);
                usersRef.update(params);
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