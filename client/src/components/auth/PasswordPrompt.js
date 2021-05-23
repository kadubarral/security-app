import React, {useContext, useState} from "react";
import UserContext, {USER_KEY} from "../../context/UserContext";
import ErrorMessage from "../misc/ErrorMessage";
import "./AuthForm.scss";
import {loadAndDecrypt, setSessionPassword} from "../../util/crypto";

function PasswordPrompt() {
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const {setPasswordSet} = useContext(UserContext);

    async function login(e) {
        e.preventDefault();
        if (!password) {
            alert("Please enter your password.");
            return;
        }

        console.log({password})

        setSessionPassword(password);
        try {
            const user = loadAndDecrypt(USER_KEY);
            if (user) {
                // decryption successful, password match
                setPasswordSet(true);
            }
        } catch (err) {
            alert("Invalid password, please try again.");
            // clears the incorrect password hash
            sessionStorage.clear();
        }
    }

    return (
        <div className="auth-form">
            <h2>Please enter your password</h2>
            {errorMessage && (
                <ErrorMessage
                    message={errorMessage}
                    clear={() => setErrorMessage(null)}
                />
            )}
            <form className="form" onSubmit={login}>
                <label htmlFor="form-password">Password</label>
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

export default PasswordPrompt;
