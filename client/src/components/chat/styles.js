
const commonMessageItemStyle = {
    display: "flex",
    marginBottom: 20,
    marginRight: 10,
    border: "1px solid #969696",
    padding: 20,
}

const commonContactItemStyle = {
    display: "flex",
    justifyContent: 'center',
    marginBottom: 20,
    marginLeft: 10,
    border: "1px solid #969696",
    cursor: "pointer"
}

export const styles = {
    container: {
        display: "flex",
        background: "white"
    },
    contacts: {
        flex: 2,
        display: "flex",
        flexDirection: "column",
    },
    contactsHeader: {
        alignSelf: "center",
        marginBottom: 20,
        marginTop: 10
    },
    messagesHeader: {
        alignSelf: "center",
        marginBottom: 10,
        marginTop: 10
    },
    messages: {
        display: "flex",
        flexDirection: "column",
        flex: 6,
        paddingLeft: 20
    },
    contactItemOnline: {
        ...commonContactItemStyle,
        background: "#bada55"
    },
    contactItemOffline: {
        ...commonContactItemStyle,
        background: "#f4b5b5"
    },
    messageSent: {
        ...commonMessageItemStyle,
        justifyContent: 'flex-end',
        background: "#b2cbde"
    },
    messageReceived: {
        ...commonMessageItemStyle,
        justifyContent: 'flex-start',
        background: "#fff0f5"
    },
    boxContainer: {
        display: "flex",
    },
    messageBox: {
        background: "#d8e1e8",
        border: "1px solid #969696",
        marginBottom: 10
    },
    sendButton: {
        background: "#d8e1e8",
        width: 60,
        height: 40,
        alignSelf: "center",
        border: "1px solid #969696",
        marginLeft: 10,
        marginRight: 10
    },
    messageContainer: {
        display: "flex",
        flexDirection: "column",

    },
    messageHeader: {
        fontSize: 12,
        alignSelf: "center",
        marginBottom: 10
    },
    clearButton: {
        background: "#fff0f5",
        fontSize: 12,
        width: 60,
        height: 40,
        alignSelf: "center",
        border: "1px solid #969696",
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10
    },
}