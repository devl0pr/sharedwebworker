importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js");

let db = null;
let usersRef = null;
let init = false;


// Initialize Firebase once when the service worker is installed
self.addEventListener('install', (event) => {
    console.log('Service worker installing...');
    // Perform install steps
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activated...');
    // Claim clients immediately after activation
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', async (event) => {
    const { type, config, authToken, params, key, ref } = event.data;

    if (type === 'connect') {

        if (!init) {
            console.log('Initializing Firebase...');
            firebase.initializeApp(config);

            firebase.auth().signInWithCustomToken(authToken)
                .then((userCredential) => {
                    console.log('Signed in with Firebase');
                    // Signed in
                    const user = userCredential.user;

                    db = firebase.database();

                    if ( db && !init ) {
                        console.log(Date.now().toString());
                        init = true;
                        console.log(ref)
                        usersRef = db.ref(ref);
                        usersRef.on('value', function(snap) {
                            broadcastMessage({ message: snap.val() });
                        });
                    }
                    else {
                        console.log('DB IS NOT INITIALIZED');
                    }
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;

                    console.log(errorCode, errorMessage);
                });
        }
        else
        {
            console.log('Firebase is already Initialized...');
        }

        // Confirm connection with the tab
        event.source.postMessage({ type: 'connect', message: 'Service worker connected' });

    } else if (type === 'disconnect') {
        console.log(`Tab with key ${key} disconnected`);
        try {
            // await firebase.auth().signOut();
            // console.log('Signed out of Firebase');
        } catch (error) {
            console.error('Error during sign-out:', error.message);
        }

    } else if (type === 'updateRef') {
        console.log(usersRef)
        if (usersRef) {
            usersRef.update(params);
        }
    }
});

// Function to broadcast messages to all clients
async function broadcastMessage(message) {
    const clients = await self.clients.matchAll();

    console.log(clients, message);
    clients.forEach(client => {
        client.postMessage(message);
    });
}
