import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "./styles.css";
import { useUser } from "../context/userContext.jsx"; 
import { Link } from "react-router-dom"; 
import FileDecryptor from "../components/FileDecryptor.jsx"; // Import the FileDecryptor component

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [encryptedFileCID, setEncryptedFileCID] = useState("");
  const [keyCID, setKeyCID] = useState("");

  const { user } = useUser();
  const userID = user ? user._id : null;   // Ensure user ID is properly set

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 🔹 Encrypt the File & Generate SHA-256 Hash of the Encrypted File
  const encryptFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const fileData = new Uint8Array(reader.result);

        // 🔥 Generate a Random 256-bit AES Key
        const key = CryptoJS.lib.WordArray.random(32);
        const keyBase64 = CryptoJS.enc.Base64.stringify(key);

        // 🔥 Encrypt the File
        const encrypted = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(fileData),
          keyBase64
        ).toString();

        // 🔹 Generate the SHA-256 Hash of the Encrypted File
        const encryptedHash = CryptoJS.SHA256(encrypted).toString();
        setFileHash(encryptedHash);  // Store the encrypted hash

        // 🔹 Convert to Blob for IPFS Upload
        const encryptedBytes = new TextEncoder().encode(encrypted);
        const encryptedBlob = new Blob([encryptedBytes], { type: "application/pdf" });
        const keyBlob = new Blob([keyBase64], { type: "text/plain" });

        resolve({
          encryptedFile: encryptedBlob,
          encryptionKey: keyBlob,
          encryptedHash: encryptedHash,
          decryptionKey: keyBase64
        });
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // 🔹 Upload to IPFS (Fixed Headers)
  const uploadToIPFS = async (fileBlob, fileName) => {
    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "pinata_api_key": import.meta.env.VITE_PINATA_API_KEY,     // ✅ Load from .env
            "pinata_secret_api_key": import.meta.env.VITE_PINATA_SECRET_API_KEY  // ✅ Load from .env
          }
        }
      );
      return response.data.IpfsHash;
    } catch (error) {
      console.error("IPFS Upload Error:", error.response ? error.response.data : error.message);
      return null;
    }
  };

  // 🔹 Handle Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }

    setUploadMessage("Encrypting file, generating hash, and uploading...");

    try {
      // 🔥 Step 1: Encrypt the file and get its hash
      const { encryptedFile, encryptionKey, encryptedHash, decryptionKey } = await encryptFile(file);

      // 🔥 Step 2: Upload the encrypted file to IPFS
      const encryptedFileCID = await uploadToIPFS(encryptedFile, `encrypted_${file.name}`);
      if (!encryptedFileCID) throw new Error("Failed to upload encrypted file.");

      // 🔥 Step 3: Upload the encryption key to IPFS
      const keyCID = await uploadToIPFS(encryptionKey, `key_${file.name}.txt`);
      if (!keyCID) throw new Error("Failed to upload encryption key.");

      // 🔥 Step 4: Store the data in the backend (Corrected Backend URL)
      const res = await fetch("http://localhost:4000/api/file/new-file", {  // ✅ Corrected Backend Port
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userID,
          pdf_url: `https://gateway.pinata.cloud/ipfs/${encryptedFileCID}`,
          hash: encryptedHash,
          encryptedFileCID: encryptedFileCID,
          encryptionKeyCID: keyCID,
          decryptionKey: decryptionKey,
          filename: file.name
        })
      });

      const data = await res.json();
      console.log("Backend Response:", data);

      // 🔥 Store CIDs in State
      setEncryptedFileCID(encryptedFileCID);
      setKeyCID(keyCID);

      setUploadMessage("✅ File uploaded successfully!");
    } catch (error) {
      console.error("Error during encryption/upload:", error);
      setUploadMessage("❌ Error uploading file.");
    }
  };

  return (
    <div>
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li><a href="/newhome" className="btn-action">Home</a></li>
            <li>
              <Link to="/profile" className="btn-action">Profile</Link>  {/* ✅ Navigate to File page */}
            </li>
          </ul>
        </nav>
      </header>

      <main className="upload-container">
        <div className="card">
          <h2>File Notarization</h2>
          <form onSubmit={handleUpload}>
            <input type="file" onChange={handleFileChange} required />
            <button type="submit">Notarize</button>
          </form>
        </div>

        <div className="result-card">
          <h3>Upload Result</h3>
          {uploadMessage && <p>{uploadMessage}</p>}
        </div>

        {/* File Decryptor Component */}
        <FileDecryptor encryptedFileCID={encryptedFileCID} keyCID={keyCID} />
      </main>
    </div>
  );
};

export default UploadFile;