import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "./styles.css";
import { useUser } from "../context/userContext.jsx"; 
import { Link } from "react-router-dom"; 
import { v4 as uuidv4 } from "uuid";


const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [encryptedFileCID, setEncryptedFileCID] = useState("");
  const [keyCID, setKeyCID] = useState("");
  const [verificationKey, setVerificationKey] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const { user } = useUser();
  const userID = user ? user._id : null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const encryptFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const fileData = new Uint8Array(reader.result);

        const key = CryptoJS.lib.WordArray.random(32);
        const keyBase64 = CryptoJS.enc.Base64.stringify(key);

        const encrypted = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(fileData),
          keyBase64
        ).toString();

        const encryptedHash = CryptoJS.SHA256(encrypted).toString();
        setFileHash(encryptedHash);

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

  const uploadToIPFS = async (fileBlob, fileName) => {
    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "pinata_api_key": import.meta.env.VITE_PINATA_API_KEY,
            "pinata_secret_api_key": import.meta.env.VITE_PINATA_SECRET_API_KEY
          }
        }
      );
      return response.data.IpfsHash;
    } catch (error) {
      console.error("IPFS Upload Error:", error.response ? error.response.data : error.message);
      return null;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadMessage("Please select a file to upload.");
      return;
    }
  
    setUploadMessage("Encrypting file, generating hash, and uploading...");
    setShowResult(false);
  
    try {
      const generatedKey = uuidv4();
      setVerificationKey(generatedKey);
  
      const { encryptedFile, encryptionKey, encryptedHash, decryptionKey } = await encryptFile(file);
  
      const encryptedFileCID = await uploadToIPFS(encryptedFile, `encrypted_${file.name}`);
      if (!encryptedFileCID) throw new Error("Failed to upload encrypted file.");
  
      const keyCID = await uploadToIPFS(encryptionKey, `key_${file.name}.txt`);
      if (!keyCID) throw new Error("Failed to upload encryption key.");
  
      const res = await fetch("http://localhost:4000/api/file/new-file", {
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
          filename: file.name,
          verificationKey: generatedKey
        })
      });
  
      const data = await res.json();
      console.log("Backend Response:", data);
  
      setEncryptedFileCID(encryptedFileCID);
      setKeyCID(keyCID);
      setUploadMessage("✅ File uploaded successfully!");
      setShowResult(true);
    } catch (error) {
      console.error("Error during encryption/upload:", error);
      setUploadMessage("❌ Error uploading file.");
      setShowResult(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationKey);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      setCopySuccess("Failed to copy!");
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
              <Link to="/profile" className="btn-action">Profile</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="upload-container">
        <div className="card upload-card">
          <h2>File Notarization</h2>
          <p className="description">Securely notarize your documents with blockchain technology.</p>
          
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-container">
              <input 
                type="file" 
                id="file-upload" 
                onChange={handleFileChange} 
                required 
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-label">
                {file ? file.name : "Choose a file"}
              </label>
            </div>
            <button type="submit" className="upload-button">Notarize Document</button>
          </form>
          
          {uploadMessage && (
            <p className={`upload-message ${uploadMessage.includes("✅") ? "success" : uploadMessage.includes("❌") ? "error" : "info"}`}>
              {uploadMessage}
            </p>
          )}

          
        </div>
      </main>

      <style jsx>{`
        .upload-card {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }

        .description {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .file-input-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .file-label {
          display: block;
          padding: 12px 16px;
          background-color: #f5f5f5;
          border: 2px dashed #ccc;
          border-radius: 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-label:hover {
          border-color: #3498db;
          background-color: #edf7fd;
        }

        .upload-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }

        .upload-button:hover {
          background-color: #2980b9;
        }

        .upload-message {
          padding: 12px;
          border-radius: 6px;
          margin-top: 1rem;
          text-align: center;
        }

        .upload-message.success {
          background-color: #d4edda;
          color: #155724;
        }

        .upload-message.error {
          background-color: #f8d7da;
          color: #721c24;
        }

        .upload-message.info {
          background-color: #e2f3f7;
          color: #0c5460;
        }

        .verification-result {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }

        .key-container {
          display: flex;
          align-items: center;
          background-color: #eee;
          padding: 0.75rem;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .key-text {
          flex: 1;
          font-family: monospace;
          word-break: break-all;
        }

        .copy-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 10px;
          white-space: nowrap;
        }

        .important-note {
          color: #e74c3c;
          font-weight: bold;
          margin-top: 1rem;
        }

        .verify-link {
          display: inline-block;
          margin-top: 1rem;
          padding: 8px 16px;
          background-color: #27ae60;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .verify-link:hover {
          background-color: #219653;
        }
      `}</style>
    </div>
  );
};

export default UploadFile;

