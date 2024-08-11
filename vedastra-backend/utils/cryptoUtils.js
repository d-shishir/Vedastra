const crypto = require("crypto");

// Generate ECDH key pair
const generateKeyPair = () => {
  const ecdh = crypto.createECDH("secp256k1");
  ecdh.generateKeys();
  return {
    publicKey: ecdh.getPublicKey("hex"),
    privateKey: ecdh.getPrivateKey("hex"),
    ecdh,
  };
};

// Derive a shared secret from a private key and a public key
const deriveSecret = (privateKey, publicKey) => {
  const ecdh = crypto.createECDH("secp256k1");
  ecdh.setPrivateKey(Buffer.from(privateKey, "hex"));
  const secret = ecdh.computeSecret(Buffer.from(publicKey, "hex"));
  console.log("Derived secret (hex):", secret.toString("hex"));
  return secret.slice(0, 32); // Ensure the secret is 32 bytes long for AES-256
};

// Encrypt a message using the shared secret
const encryptMessage = (message, secret) => {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secret), iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"), // Convert IV to hexadecimal
    encryptedMessage: encrypted,
  };
};

// Decrypt a message using the shared secret
const decryptMessage = (encryptedMessage, secret, iv) => {
  try {
    const ivBuffer = Buffer.from(iv, "hex"); // Convert IV from hexadecimal to buffer
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(secret),
      ivBuffer
    );
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
};

module.exports = {
  generateKeyPair,
  deriveSecret,
  encryptMessage,
  decryptMessage,
};
