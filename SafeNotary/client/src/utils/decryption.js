import CryptoJS from "crypto-js";

export const decryptFile = (encryptedData, decryptionKey) => {
  const key = CryptoJS.enc.Base64.parse(decryptionKey);
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  const decryptedFile = decrypted.toString(CryptoJS.enc.Utf8);
  return decryptedFile;
};

export const downloadDecryptedFile = (decryptedFile, filename) => {
  const blob = new Blob([decryptedFile], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};