import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import "./styles.css";
import { useUser } from "../context/userContext.jsx"; 

const generateSHA256Hash = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const wordArray = CryptoJS.lib.WordArray.create(reader.result);
            const hash = CryptoJS.SHA256(wordArray).toString(); // Generate SHA-256 hash
            resolve(hash);
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file); // Read file as binary
    });
};


const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [keyHash, setKeyHash] = useState("");
  const {user} = useUser();
  const userID = user._id; 
  

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 🔹 Encryption Function (Directly Inside the Page)
  const encryptFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const fileData = new Uint8Array(reader.result); // Read as binary
  
        // Generate a random 256-bit AES key (32 bytes)
        const key = CryptoJS.lib.WordArray.random(32); 
        const keyBase64 = CryptoJS.enc.Base64.stringify(key); // Convert key to Base64
  
        // Encrypt the binary data
        const encrypted = CryptoJS.AES.encrypt(
          CryptoJS.lib.WordArray.create(fileData),
          keyBase64
        ).toString();
  
        // Convert encrypted data into a Blob (PDF format)
        const encryptedBytes = new TextEncoder().encode(encrypted);
        const encryptedBlob = new Blob([encryptedBytes], { type: "application/pdf" });
  
        // Convert key to a Blob
        const keyBlob = new Blob([keyBase64], { type: "text/plain" });
  
        // 🔥 Generate the decryption key (same as the encryption key)
        const decryptionKey = keyBase64;
  
        resolve({
          encryptedFile: encryptedBlob,
          encryptionKey: keyBlob,
          decryptionKey: decryptionKey,  
        });
      };
  
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file); // Read file as binary
    });
  };
  

  // 🔹 Upload to IPFS (Pinata)
  const uploadToIPFS = async (fileBlob, fileName) => {
    const formData = new FormData();
    formData.append("file", fileBlob, fileName);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMDdkNDAxNy00MDg0LTQ1OWQtOTdlZi1hMzI5MmFjMDNkNGEiLCJlbWFpbCI6ImRpbHByaXlhdGtAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjdjYWFjZTFiZDFjNDhkZTNhZDkyIiwic2NvcGVkS2V5U2VjcmV0IjoiNWZlM2U3NmQ2YmZkODdmZTJmNWZiMDc2NjNlNDZlMTIxZmIyMWIwMGZmZjdkYTVkYTJkOWU0MWRhNGE3NDlhMiIsImV4cCI6MTc3MzczMzk1Nn0.t6GyAe2bwtjih7mJCz1FR2sgoug3pftBCxj6a_a6kpI`, // Replace with your API Key
          },
        }
      );
      return response.data.IpfsHash;
    } catch (error) {
      console.error("IPFS upload error:", error);
      return null;
    }
  };

  // 🔹 Encrypt & Upload Button Handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
        setUploadMessage("Please select a file to upload.");
        return;
    }

    setUploadMessage("Computing file hash, encrypting, and uploading...");

    try {
        // Step 1: Generate SHA-256 hash before encryption
        const fileHash = await generateSHA256Hash(file);
        console.log("SHA-256 Hash:", fileHash); // Debugging output

        // Step 2: Encrypt the file
        const { encryptedFile, encryptionKey, decryptionKey } = await encryptFile(file);

        // Step 3: Upload the encrypted file to IPFS
        const encryptedFileCID = await uploadToIPFS(encryptedFile, "encrypted_" + file.name);
        if (!encryptedFileCID) throw new Error("Failed to upload encrypted file.");

        // Step 4: Upload the encryption key to IPFS
        const encryptionKeyCID = await uploadToIPFS(encryptionKey, "key_" + file.name + ".txt");
        if (!encryptionKeyCID) throw new Error("Failed to upload encryption key.");

        // Step 5: Store IPFS CIDs and hash in state (For display/logging)
        setFileHash(fileHash);

        const res = await fetch("http://localhost:4000/api/file/new-file", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: userID,
            pdf_url: "shdhfkksjdfsjdfk",
            hash: fileHash,
            encryptedFileCID: encryptedFileCID,
            decryptionKey: decryptionKey
          })
        })
        const data = await res.json();
        console.log(data);
        
        
        setUploadMessage("File uploaded successfully!");

        console.log("✅ File Hash:", fileHash);
        console.log("📄 Encrypted File CID:", encryptedFileCID);
        console.log("🔑 Encryption Key CID:", encryptionKeyCID);
    } catch (error) {
        console.error("Error during encryption/upload:", error);
        setUploadMessage("Error uploading file to IPFS.");
    }
};

  return (
    <div>
      {/* Navigation Bar */}
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li><a href="/newhome" className="btn-action">Home</a></li>
          </ul>
        </nav>
      </header>

      {/* Upload File Section */}
      <main className="upload-container">
        <div className="card">
          <h2>Upload & Encrypt File</h2>
          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
            <button type="submit" className="upload-btn">Encrypt & Upload</button>
          </form>
        </div>

        {/* Upload Result */}
        <div className="result-card">
        {fileHash && (
    <p>
      🔍 File SHA-256 Hash: <br />
      <span style={{ wordBreak: "break-all" }}>{fileHash}</span>
    </p>
)}

          <h3>Upload Result</h3>
          {uploadMessage && <p>{uploadMessage}</p>}
          {fileHash && (
            <p>
              📄 Encrypted File: 
              <a href={`https://gateway.pinata.cloud/ipfs/${fileHash}`} target="_blank" rel="noopener noreferrer">
                {fileHash}
              </a>
            </p>
          )}
          
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2024 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UploadFile;
