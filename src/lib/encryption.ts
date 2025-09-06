/**
 * Client-side encryption utilities using Web Crypto API
 * Provides RSA key generation, encryption, and decryption for secure messaging
 */

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface SerializedKeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generates a new RSA key pair for encryption/decryption
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  return keyPair;
}

/**
 * Exports a key pair to serializable format (base64 strings)
 */
export async function exportKeyPair(keyPair: KeyPair): Promise<SerializedKeyPair> {
  const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKeyBuffer),
    privateKey: arrayBufferToBase64(privateKeyBuffer),
  };
}

/**
 * Imports a key pair from serialized format
 */
export async function importKeyPair(serializedKeys: SerializedKeyPair): Promise<KeyPair> {
  const publicKeyBuffer = base64ToArrayBuffer(serializedKeys.publicKey);
  const privateKeyBuffer = base64ToArrayBuffer(serializedKeys.privateKey);

  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );

  return { publicKey, privateKey };
}

/**
 * Imports a public key from base64 string
 */
export async function importPublicKey(publicKeyString: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(publicKeyString);
  
  return await crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

/**
 * Encrypts a message using the recipient's public key
 */
export async function encryptMessage(message: string, publicKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    data
  );

  return arrayBufferToBase64(encryptedBuffer);
}

/**
 * Decrypts a message using the user's private key
 */
export async function decryptMessage(encryptedMessage: string, privateKey: CryptoKey): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedMessage);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Helper function to convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}