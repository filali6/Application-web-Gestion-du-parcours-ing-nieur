import crypto from "crypto";

// Définir une clé fixe et forte
const ENCRYPTION_KEY = Buffer.from(
  "b6e0e70b4f3e4eeb92ab2a4f82fb9d69d4247396f0cb7260d564ee7a93db3cd1",
  "hex"
);
const IV_LENGTH = 16;

// Fonction de chiffrement
export const encryptPassword = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Fonction de déchiffrement
export const decryptPassword = (encryptedText) => {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedTextBytes = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedTextBytes);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
