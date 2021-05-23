import Axios from "axios";
import React, { useState } from "react";
import domain from "../../util/domain";
import ErrorMessage from "../misc/ErrorMessage";
import SuccessMessage from "../misc/SuccessMessage";
import "./AuthForm.scss";

function Register() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formScl, setFormScl] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  async function register(e) {
    e.preventDefault();

    const registerData = {
      name: formName,
      email: formEmail,
      username: formUsername,
      scl: formScl,
    };

    try {
      const user = await Axios.post(`${domain}/auth/register`, registerData);
      setSuccessMessage(user.data.onetimeid);
      //store user information in local storage
      console.log(user.data.email);
    } catch (err) {
      if (err.response) {
        if (err.response.data.errorMessage) {
          setErrorMessage(err.response.data.errorMessage);
        }
      }
      return;
    }
  }

  return (
    <div className="auth-form">
      <h2>Register a new account</h2>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          clear={() => setErrorMessage(null)}
        />
      )}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          clear={() => setSuccessMessage(null)}
        />
      )}
      <form className="form" onSubmit={register}>
        <label htmlFor="form-name">Name</label>
        <input
          id="form-name"
          type="name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />

        <label htmlFor="form-email">Email</label>
        <input
          id="form-email"
          type="email"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
        />

        <label htmlFor="form-username">Username</label>
        <input
          id="form-username"
          type="username"
          value={formUsername}
          onChange={(e) => setFormUsername(e.target.value)}
        />

        <label htmlFor="form-scl">Security Level</label>
        <input
          id="form-scl"
          type="scl"
          value={formScl}
          onChange={(e) => setFormScl(e.target.value)}
        />

        <button className="btn-submit" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
