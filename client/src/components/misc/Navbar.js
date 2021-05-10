import Axios from "axios";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../context/UserContext";
import domain from "../../util/domain";
import "./Navbar.scss";
import ComputerIcon from "../../images/icons/computer.png";

function Navbar() {
  const { user, getUser } = useContext(UserContext);

  async function logOut() {
    await Axios.get(`${domain}/auth/logOut`);
    await getUser();
  }

  return (
    <div className="navbar">
      <Link to="/">
        <img className="icon" src={ComputerIcon} alt="computer" />
      </Link>
      <Link to="/">
        <h1 className="title">Security App</h1>
      </Link>       
      <div className="links">
          <Link to="/articles">Articles</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/admin">Admin</Link>
      </div>
      {user === null ? (
        <>
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        user && (
          <button className="btn-logout" onClick={logOut}>
            Log out
          </button>
        )
      )}
    </div>
  );
}

export default Navbar;
