const crypto = require("crypto");

// Generate a key pair using Diffie-Hellman
const generateKeyPair = () => {
  const dh = crypto.createDiffieHellman(2048);
  const publicKey = dh.generateKeys("hex");
  const privateKey = dh.getPrivateKey("hex");
  return { publicKey, privateKey, dh };
};

// Derive a shared secret using Diffie-Hellman
const deriveSecret = (privateKey, publicKey) => {
  const dh = crypto.createDiffieHellman(2048);
  dh.setPrivateKey(Buffer.from(privateKey, "hex"));
  const secret = dh.computeSecret(Buffer.from(publicKey, "hex"), "hex");
  return secret;
};

// Encrypt a message using the shared secret
const encryptMessage = (message, secret) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secret, "hex"),
    iv
  );
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    encryptedMessage: encrypted,
  };
};

// Decrypt a message using the shared secret
const decryptMessage = (encryptedMessage, secret, iv) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secret, "hex"),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = {
  generateKeyPair,
  deriveSecret,
  encryptMessage,
  decryptMessage,
};
