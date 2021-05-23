import io from "socket.io-client";
import React, {createContext, useContext, useEffect, useState} from "react";
import {
    decryptMessage,
    encryptMessage,
    isSignatureValid,
    publicKeyPemToObject,
    signUsername
} from "../util/crypto";
import ChatContext from "./ChatContext";
import UserContext from "./UserContext";
import domain from "../../util/domain";

const SocketContext = createContext({
    name: "socket"
});

const CONNECTION_PORT = `${domain}/`;

export function SocketContextProvider(props) {
    const [socket, setSocket] = useState(null);
    const [incomingMessages, setIncomingMessages] = useState([]);

    const { user, keypair } = useContext(UserContext);
    const { contactList, addMessageToHistory, setContactList } = useContext(ChatContext);

    function addIncomingMessage(messageObject) {
        console.log("Incoming message from: ", messageObject.from);
        setIncomingMessages([...incomingMessages, messageObject]);
    }

    function connect() {
        try {
            const socket = io(CONNECTION_PORT);
            socket.on('disconnect', () => {
                console.log('socket disconnected');
                alert('The server closed the socket connection!');
                window.location.reload();
            });
            setSocket(socket);
        } catch (err) {
            console.error("Error connecting to backend socket", err);
            alert("Error connecting to the backend socket.");
            window.location.reload();
        }
    }

    function checkIn() {
        if (!socket) {
            connect();
        }
        if (socket) {
            try {
                const {username} = user;
                // signs the username with our pk to prove our identity
                const signature = signUsername(username, keypair.privateKey);

                socket.emit('check-in', {
                    username,
                    signature
                });
            } catch (err) {
                console.error("Error checking in", err);
                alert("Error entering in chat");
            }
        }
    }

    function sendMessage(messageObject, senderPrivateKey, recipientPublicKey) {
        const messagePayload = JSON.stringify(messageObject)
        const {encryptedMessage, signature} = encryptMessage(messagePayload, senderPrivateKey, recipientPublicKey);
        const {from, to} = messageObject;

        socket.emit('message-sent', {
            encryptedMessage,
            signature,
            from,
            to
        });
    }

    async function handleIncomingMessage(messageObject) {
        const {
            encryptedMessage,
            signature,
        } = messageObject;

        // gets the sender's public key from the contact list
        const sender = contactList?.find(c => c.username === messageObject.from);
        if (!sender) {
            throw new Error("Could not find sender on the local contact list!");
        }

        // transforms the key from text to ursa object
        const senderPublicKey = publicKeyPemToObject(sender.publicKey);

        // decrypts the message and validates the signature
        const decrypted = decryptMessage(encryptedMessage, keypair.privateKey);
        const valid = isSignatureValid(decrypted, signature, senderPublicKey);

        if (!valid) {
            console.error("Unable to verify incoming message's signature");
            return;
        }

        addMessageToHistory(JSON.parse(decrypted));
    }

    useEffect(() => {
        if (user) {
            // once the user is logged in
            // we connect to the backend to join the chat
            checkIn();
        }
    }, [socket, user]);


    useEffect(() => {
        if (socket) {
            // once connected listen to socket events
            socket.on('contact-list', setContactList);
            socket.on('message-received', addIncomingMessage);
        }
    }, [socket]);

    useEffect(() => {
        if (incomingMessages.length) {
            // every time new messages arrive we process them
            incomingMessages.forEach(messageObject => handleIncomingMessage(messageObject));
            // then whe clear the list
            setIncomingMessages([]);
        }
    }, [incomingMessages]);

    return (
        <SocketContext.Provider value={{ sendMessage }}>
            {props.children}
        </SocketContext.Provider>
    );

}

export default SocketContext;