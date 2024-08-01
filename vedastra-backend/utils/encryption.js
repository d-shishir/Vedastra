const crypto = require("crypto");

const algorithm = "aes-256-ctr";
const secretKey = process.env.CHAT_SECRET_KEY;
const iv = crypto.randomBytes(16);

const encryptMessage = (text) => {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

const decryptMessage = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(hash.iv, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};

module.exports = { encryptMessage, decryptMessage };
