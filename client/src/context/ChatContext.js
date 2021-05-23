import React, {createContext, useEffect, useState, useContext} from "react";
import UserContext from "./UserContext";
import {encryptAndStore, loadAndDecrypt} from "../util/crypto";

const MESSAGE_HISTORY_KEY = 'storage:messages';

const ChatContext = createContext({
    name: "chat"
});

export function ChatContextProvider(props) {
    const [contactList, setContactListInContext] = useState([]);
    const [messageHistory, setMessageHistoryInContext] = useState({});

    const { user } = useContext(UserContext);

    function setContactList(users) {
        // excludes the current user from the list
        const contacts = users.filter(u => u.username !== user.username);
        // sorts online contacts before offline ones
        contacts.sort((a, b) => {
            if (a.isOnline === b.isOnline) {
                // when both are online or offline sort
                // by name
                return a.username.localeCompare(b.username);
            }
            if (a.isOnline && !b.isOnline) {
                return -1;
            }
            return 1;
        })
        setContactListInContext(contacts);
    }

    function loadMessageHistoryFromStorage() {
        const history = loadAndDecrypt(MESSAGE_HISTORY_KEY) || {};
        setMessageHistoryInContext(history);
    }

    function addMessageToHistory({id, text, time, from, to}) {
        // gets the username of the other contact involved in the message
        const contactUsername = from === user.username ? to : from;

        if (!messageHistory[contactUsername]) {
            messageHistory[contactUsername] = [];
        }

        if (messageHistory[contactUsername].find(m => m.id === id)) {
            // duplicate message, ignore
            return;
        }

        // adds the message to the end of the list (keep older messages first)
        // we need to make sure messageHistory is a different object
        // so we use spread instead of a simple messageHistory[contactUsername].push()
        const newMessageHistory = {
            ...messageHistory,
            [contactUsername]: [
                ...messageHistory[contactUsername],
                {text, time, from, to}
            ]
        };
        setMessageHistoryInContext(newMessageHistory);
        // saves the message history on the local storage
        encryptAndStore(MESSAGE_HISTORY_KEY, newMessageHistory);
    }

    function clearMessageHistory(username, messageHistory) {
        // removes the records of conversations with an user
        const newMessageHistory = {
            ...messageHistory,
            [username]: []
        };

        setMessageHistoryInContext(newMessageHistory);
        encryptAndStore(MESSAGE_HISTORY_KEY, newMessageHistory);
    }

    useEffect(() => {
        loadMessageHistoryFromStorage();
    }, []);


    return (
        <ChatContext.Provider value={{ contactList, messageHistory, setContactList, addMessageToHistory, clearMessageHistory }}>
            {props.children}
        </ChatContext.Provider>
    );

}

export default ChatContext;