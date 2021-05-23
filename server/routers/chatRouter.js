const ursa = require("ursa-purejs");
const User = require("../models/userModel");

let activeSockets = [];

async function pushContactListToClients() {
    // loads all users that have the public key set up
    const users = await User.find({publicKey: {$exists: true}})

    // marks the ones online
    const usersWithStatus = users.map(user => {
        const isOnline = !!activeSockets.find(s => s.username === user.username);
        return {
            username: user.username,
            publicKey: user.publicKey,
            isOnline
        }
    });

    // sends the user list to all active sockets
    activeSockets.forEach(({socket}) => {
        try {
            socket.emit('contact-list', usersWithStatus);
        } catch (err) {
            console.error("Error pushing contact list to socket: " + socket.id, err);
        }
    })
}

function isUsernameSignatureValid(username, signature, publicKeyPem) {
    // loads the user's public key
    const publicKey = ursa.createPublicKey(publicKeyPem);
    // verifies that the user is indeed the owner of the key
    const usernameHex = new Buffer.from(username).toString('hex');
    return publicKey.hashAndVerify('sha256', usernameHex, signature, 'hex');
}

async function handleCheckIn(socket, params) {
    const {username, signature} = params;
    console.log("User checked in: " + username);

    const user = await User.findOne({username});
    if (!user) {
        console.log("User not found: " + username);
        socket.disconnect();
        return;
    }

    // verifies the signature matches the username
    if (!isUsernameSignatureValid(username, signature, user.publicKey)) {
        console.log("Invalid username signature for: " + username);
        socket.disconnect();
        return;
    }

    // adds user to the online list
    activeSockets.push({
        socket,
        username
    });

    // notify online clients that the user is online
    await pushContactListToClients();
}

async function handleDisconnect(socket) {
    console.log('socket disconnected: ' + socket.id);
    // removes the disconnected socket fom the list
    activeSockets = activeSockets.filter(s => s.socket.id !== socket.id);

    // notify online clients that the user is offline
    await pushContactListToClients();
}

async function handleMessageSent(messageObject) {
    console.log("message-sent", messageObject);

    // finds the active socket for the recipient
    const recipientSocket = activeSockets.find(s => s.username === messageObject.to);
    if (recipientSocket) {
        // passes the encrypted message to the recipient
        recipientSocket.socket.emit("message-received", messageObject);
    }
}

module.exports = {
    handleDisconnect,
    handleCheckIn,
    handleMessageSent
}