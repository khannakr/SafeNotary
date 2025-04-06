import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/userContext.jsx";
import "./styles.css";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";


const Profile = () => {
  const { user } = useUser();
  const userID = user ? user._id : null;

  const [userData, setUserData] = useState(user);
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  console.log("files", files);
  
  // ✅ Fetch User Data
   useEffect(() => {
    const fetchFiles = async () => {
      try {
        axios.get(`http://localhost:4000/api/file/get/${userID}`).then((response) => {
          console.log(response);
          setFiles(response.data.files);
          console.log("Files: ", response.data.files);
          
        }).catch((error) => {
          console.error("Error fetching user files: ", error);
        })
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    }

    fetchFiles();
  }, []);

  // ✅ Handle File Click to Show Details
  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleDownload = async (file) => {
    try {
      // 1. Fetch encrypted file from IPFS
      const encryptedFileUrl = `https://gateway.pinata.cloud/ipfs/${file.encryptedFileCID}`;
      const response = await fetch(encryptedFileUrl);
      const encryptedText = await response.text(); // because encrypted file was saved as a Base64-encoded string
  
      // 2. Get decryption key (assumes it's stored in DB)
      const decryptionKey = file.decryptionKey;
      if (!decryptionKey) {
        alert("Decryption key not found.");
        return;
      }
  
      // 3. Decrypt using CryptoJS
      const decrypted = CryptoJS.AES.decrypt(encryptedText, decryptionKey);
      const decryptedWordArray = decrypted;
      const decryptedUint8Array = new Uint8Array(
        decryptedWordArray.words.map((word, i) =>
          (i === decryptedWordArray.words.length - 1
            ? (word >> 24) & 0xff
            : [word >> 24, word >> 16, word >> 8, word]
          )
        ).flat().filter((_, i) => i < decrypted.sigBytes)
      );
  
      // 4. Convert to Blob
      const blob = new Blob([decryptedUint8Array], { type: "application/pdf" });
  
      // 5. Trigger file download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);ed
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading or decrypting file:", error);
      alert("Failed to download or decrypt the file.");
    }
  };
  

  return (
    <div>
      {/* ✅ Navbar */}
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li><Link to="/newhome" className="btn-action">Home</Link></li>
            <li><Link to="/upload" className="btn-action">Upload</Link></li>
          </ul>
        </nav>
      </header>

      <main className="profile-container">
        <div className="profile-card">
          <h2>Profile Information</h2>
          {user ? (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              
            </>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>

        {/* ✅ Uploaded Files Section */}
        <div className="files-card">
          <h2>Uploaded Files</h2>
          {files.length > 0 ? (
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  <p><strong>File Name:</strong> {file.filename}</p>
                  <button onClick={() => handleFileClick(file)}>View Details</button>
                  <button onClick={() => handleDownload(file)}>Download</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>

        {/* ✅ File Details Section */}
        {selectedFile && (
          <div className="file-details-card">
            <h2>File Details</h2>
            <p><strong>File Name:</strong> {selectedFile.filename}</p>
            <p><strong>IPFS Link:</strong> 
              <a href={`https://gateway.pinata.cloud/ipfs/${selectedFile.encryptedFileCID}`} target="_blank" rel="noopener noreferrer">
                {selectedFile.encryptedFileCID}
              </a>
            </p>
            <p><strong>Key CID:</strong> {selectedFile.encryptionKeyCID}</p>
            <p><strong>Timestamp:</strong> {new Date(selectedFile.createdAt).toLocaleString()}</p>
          </div>
        )}
      </main>

      <footer>
        <p>© 2025 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Profile;
