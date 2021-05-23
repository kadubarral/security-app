import Axios from "axios";
import React, {useContext, useState} from "react";
import {useHistory} from "react-router-dom";
import UserContext, {KEYPAIR_KEY, USER_KEY} from "../../context/UserContext";
import domain from "../../util/domain";
import ErrorMessage from "../misc/ErrorMessage";
import "./AuthForm.scss";
import {
    encryptAndStore,
    generateKeypair,
    setSessionPassword
} from "../../util/crypto";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [onetimeid, setOneTimeId] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const {setUser, setKeypair, setPasswordSet} = useContext(UserContext);

    const history = useHistory();

    async function login(e) {
        e.preventDefault();

        if (!username || !password || !onetimeid) {
            alert("Please enter the required information for all the fields.");
            return;
        }

        // generates a new keypair before the login
        const keypair = await generateKeypair();

        const loginData = {
            username,
            onetimeid,
            publicKey: keypair.publicKeyPem
        };

        try {
            const response = await Axios.post(`${domain}/auth/login`, loginData);

            // clears all existing data
            sessionStorage.clear();
            localStorage.clear();

            // saves hte password hash on the session storage
            // to be used to encrypt/decrypt data on the local storage
            setSessionPassword(password);

            // encrypts and stores the keypair and user data
            const {publicKeyPem, privateKeyPem} = keypair;
            encryptAndStore(KEYPAIR_KEY, {publicKeyPem, privateKeyPem})
            encryptAndStore(USER_KEY, response.data)

            // updates the context variables to re-render the components for the logged user
            setPasswordSet(true);
            setKeypair(keypair);
            setUser(response.data);

            history.push("/");
        } catch (err) {
            console.error("Error logging in", err);
            if (err.response?.data?.errorMessage) {
                setErrorMessage(err.response.data.errorMessage);
            }
        }
    }

    return (
        <div className="auth-form">
            <h2>Log in</h2>
            {errorMessage && (
                <ErrorMessage
                    message={errorMessage}
                    clear={() => setErrorMessage(null)}
                />
            )}
            <form className="form" onSubmit={login}>
                <label htmlFor="form-username">Username <h6>(provided by your organization)</h6></label>
                <input
                    id="form-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="form-onetimeid">One-time ID <h6>(provided by your organization)</h6></label>
                <input
                    id="form-onetimeid"
                    type="password"
                    value={onetimeid}
                    onChange={(e) => setOneTimeId(e.target.value)}
                />

                <label htmlFor="form-password">Set Your Local Password</label>
                <input
                    id="form-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="btn-submit" type="submit">
                    Log in
                </button>
            </form>
        </div>
    );
}

export default Login;
