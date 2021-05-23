import React, { createContext, useEffect, useState } from "react";
import {
  buildKeypairObjects,
  encryptAndStore,
  getSessionPassword,
  loadAndDecrypt,
} from "../util/crypto";
import PasswordPrompt from "../components/auth/PasswordPrompt";

const UserContext = createContext({
  name: "user"
});

export const USER_KEY = 'storage:user';
export const KEYPAIR_KEY = 'storage:keypair';

// to avoid the password promp flashing on he screen
const isPasswordInitiallySet = getSessionPassword() !== null;

export function UserContextProvider(props) {
  const [isPasswordSet, setPasswordSet] = useState(isPasswordInitiallySet);
  const [user, setUserInContext] = useState(null);
  const [keypair, setKeypair] = useState(null);

  function loadUserFromStorage() {
    const storedUser = loadAndDecrypt(USER_KEY);
    setUserInContext(storedUser);
  }

  function loadKeypairFromStorage() {
    const keypairStr = loadAndDecrypt(KEYPAIR_KEY);
    const keypair = keypairStr ? buildKeypairObjects(keypairStr) : null;
    setKeypair(keypair);
    return keypair;
  }

  function setUser(user) {
    setUserInContext(user);
    // saves the local user on the storage
    encryptAndStore(USER_KEY, user);
  }

  useEffect(() => {
    if (isPasswordSet) {
      loadKeypairFromStorage();
      loadUserFromStorage();
    }
  }, [isPasswordSet]);

  if (localStorage.getItem(USER_KEY) && !isPasswordSet) {
    // we have data encrypted locally but the session password is not set
    // so we promp for it
    return <UserContext.Provider value={{ setPasswordSet  }}>
        <PasswordPrompt/>
    </UserContext.Provider>
  }

  // local password validated, return the application components
  return (
    <UserContext.Provider value={{ user, setUser, keypair, setKeypair, isPasswordSet, setPasswordSet }}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserContext;
