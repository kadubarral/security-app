import React, {useContext, useState} from "react";
import moment from "moment";
import {styles} from "./styles";
import UserContext from "../../context/UserContext";
import {publicKeyPemToObject} from "../../util/crypto";
import ChatContext from "../../context/ChatContext";
import SocketContext from "../../context/SocketContext";

const {v4: uuidv4} = require('uuid');

function Chat() {
    const [selectedContact, setSelectedContact] = useState(null);
    const [messageBoxText, setMessageBoxText] = useState("");
    const {user: currentUser, keypair} = useContext(UserContext);
    const {contactList, messageHistory, addMessageToHistory, clearMessageHistory} = useContext(ChatContext);
    const {sendMessage} = useContext(SocketContext);


    function handleTextMessageChange(event) {
        setMessageBoxText(event.target.value);
    }

    function handleContactSelected(user) {
        if (user.username !== selectedContact?.username) {
            setMessageBoxText("");
            setSelectedContact(user)
        }
    }

    function onClear() {
        clearMessageHistory(selectedContact.username);
    }

    function onSend() {
        // look for the updated status on the contact list
        const recipient = contactList.find(c => c.username === selectedContact?.username);

        if (!recipient.isOnline) {
            alert(`${recipient.username} is offline!`);
            return;
        }
        if (messageBoxText?.trim()) {
            const {privateKey: senderPrivateKey} = keypair;
            const recipientPublicKey = publicKeyPemToObject(recipient.publicKey);

            const messageObject = {
                id: uuidv4(),
                text: messageBoxText,
                time: new Date().toISOString(),
                from: currentUser.username,
                to: recipient.username
            };

            // encrypts and sends the payload to the recipient
            sendMessage(messageObject, senderPrivateKey, recipientPublicKey);
            // saves the new message on the local history
            addMessageToHistory(messageObject)
            setMessageBoxText("");
        }
    }

    const contactItems = contactList?.map(user => {
        const fontWeight = user.username === selectedContact?.username ? "bold" : "normal";
        const itemStyle = user.isOnline ? styles.contactItemOnline : styles.contactItemOffline;
        const status = user.isOnline ? "online" : "offline";

        return <li key={user.username} style={itemStyle} onClick={() => handleContactSelected(user)}>
            <span style={{fontWeight}}>{user.username} ({status})</span>
        </li>
    });


    let messagesComponent = null;
    if (selectedContact) {
        messagesComponent = <div style={styles.messages}>
            <h3 style={styles.messagesHeader}>Chat with {selectedContact.username}</h3>

            <button style={styles.clearButton} onClick={onClear}>
                Clear
            </button>

            {!messageHistory[selectedContact.username]?.length &&
            <span style={styles.messageHeader}>No messages sent yet.</span>}

            {messageHistory[selectedContact.username]?.map(message => {
                const style = message.to === selectedContact.username ? styles.messageSent : styles.messageReceived;
                return <div key={message.time} style={styles.messageContainer}>
                    <span
                        style={styles.messageHeader}>{message.from} on {moment(message.time).format("DD/MM/YYYY HH:mm:ss")}</span>
                    <div style={style}>{message.text}</div>
                </div>
            })}

            <div style={styles.boxContainer}>
                <textarea maxLength={500}
                          style={styles.messageBox} rows={5} cols={60} value={messageBoxText}
                          onChange={handleTextMessageChange}/>
                <button style={styles.sendButton} onClick={onSend}>
                    Send
                </button>
            </div>
        </div>
    }
    return (
        <div style={styles.container}>
            <div style={styles.contacts}>
                <h3 style={styles.contactsHeader}>Contacts</h3>
                <ul>
                    {contactItems}
                </ul>
            </div>
            {messagesComponent}
        </div>
    );
}

export default Chat;
