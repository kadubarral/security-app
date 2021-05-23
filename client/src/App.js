import Axios from "axios";
import React from "react";
import {UserContextProvider} from "./context/UserContext";
import {SocketContextProvider} from "./context/SocketContext";
import {ChatContextProvider} from "./context/ChatContext";

import Router from "./Router";
import "./style/index.scss";

Axios.defaults.withCredentials = true;

function App() {
    return (
        <UserContextProvider>
            <ChatContextProvider>
                <SocketContextProvider>
                    <div className="container">
                        <Router/>
                    </div>
                </SocketContextProvider>
            </ChatContextProvider>
        </UserContextProvider>
    );
}

export default App;
