// used to generate the keypairs
import forge from 'node-forge';
// used to handle the asymmetric encryption
import ursa from 'ursa-purejs';
// used for aes256 encryption
import cryptojs from 'crypto-js';

const pki = forge.pki;
const rsa = pki.rsa;

const KEY_PAIR_KEY = 'storage:keypair';
const SESSION_PASSWORD_KEY = 'storage:passwordHash';


/**
 * Hashes and stores the password on the session storage.
 */
export function setSessionPassword(password) {
    const md = forge.md.sha1.create();
    md.update(password);
    return sessionStorage.setItem(SESSION_PASSWORD_KEY, md.digest().toHex());
}

/**
 * Retrieves the local password hash from the local storage.
 */
export function getSessionPassword() {
    return sessionStorage.getItem(SESSION_PASSWORD_KEY) || null;
}

/**
 * Builds the ursa objects for the keypair.
 */
export function buildKeypairObjects({publicKeyPem, privateKeyPem}) {
    return {
        publicKey: ursa.createPublicKey(publicKeyPem),
        publicKeyPem,
        privateKey: ursa.createPrivateKey(privateKeyPem),
        privateKeyPem
    }
}

/**
 * Generates a RSA keypair and stores on the browser's local storage.
 */
export function generateKeypair() {
   return new Promise((resolve, reject) => {
       console.log(`Generating keypair...`);
       rsa.generateKeyPair({bits: 2048, workers: 2}, function (err, keypair) {
           if (err) {
               console.error(`Error generating keypair`, err);
               reject(err)
           } else {
               console.log(`keypair generated`);
               const publicKeyPem = pki.publicKeyToPem(keypair.publicKey);
               const privateKeyPem = pki.privateKeyToPem(keypair.privateKey);

               // aves the keypair on the browser localstorage
               localStorage.setItem(KEY_PAIR_KEY, JSON.stringify({publicKeyPem, privateKeyPem}));
               resolve({...keypair, publicKeyPem, privateKeyPem});
           }
       });
   })
}



/**
* Encrypts and signs the message using RSA_PKCS1
* @param message - The text to be encrypted.
* @param senderPrivateKey - The private key of the sender.
* @param recipientPublicKey - The public key of the recipient.
* @returns The encrypted message and signature on hex format.
*/
export function encryptMessage(message, senderPrivateKey, recipientPublicKey) {
    const encryptedMessage = recipientPublicKey.encrypt(message, 'utf8', 'hex');
    // hashes the message using sha256
    const signature = senderPrivateKey.hashAndSign('sha256', message, 'utf8', 'hex');
    return {
        // make sure the bytes transit vie http in hex format
        encryptedMessage: forge.util.bytesToHex(encryptedMessage),
        signature
    }
}

/**
 * Creates a signature for an username.
 * @param username - The username to be signed.
 * @param privateKey - The private key used to sign the username.
 * @returns signature for the username.
 */
export function signUsername(username, privateKey) {
    return privateKey.hashAndSign('sha256', username, 'utf8', 'hex');
}

/**
 * Decrypts the message.
 * @param encryptedMessage - The hex representation of the encrypted bytes.
 * @param recipientPrivateKey - The private key of the message recipient.
 * @returns plain the decrypted text.
 */
export function decryptMessage(encryptedMessage, recipientPrivateKey) {
    return recipientPrivateKey.decrypt(encryptedMessage, 'hex', 'utf8');
}

/**
 * Verifies the signature for a message.
 * @param message - The decrypted message.
 * @param signature - The hex representation of the signature.
 * @param senderPublicKey - The public key of the message sender.
 * @returns boolean indication if the signature is valid.
 */
export function isSignatureValid(message, signature, senderPublicKey) {
    const messageHex = new Buffer(message).toString('hex');
    return senderPublicKey.hashAndVerify('sha256', messageHex, signature, 'hex')
}

/**
 * Transforms a public key pem text to ursa object.
 */
export function publicKeyPemToObject(publicKeyPem) {
    return ursa.createPublicKey(publicKeyPem);
}

/**
 * Encrypts a text using a password.
 */
export function encryptWithPassword(text){
    const password = getSessionPassword();
    return cryptojs.AES.encrypt(text, password).toString();
}

/**
 * Decrypts a text using a password.
 */
export function decryptWithPassword(encryptedText){
    const password = getSessionPassword();
    const bytes  = cryptojs.AES.decrypt(encryptedText, password);
    return bytes.toString(cryptojs.enc.Utf8);
}

/**
 * Encrypts a value and stored on the localstorage.
 */
export function encryptAndStore(key, value) {
    const encryptedValue = encryptWithPassword(JSON.stringify(value));
    localStorage.setItem(key, encryptedValue);
}

/**
 * Loads an entry from the localStorage and decrypts it.
 */
export function loadAndDecrypt(key) {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) {
        return null;
    }
    const decrypted = decryptWithPassword(encryptedValue);
    return JSON.parse(decrypted);
}