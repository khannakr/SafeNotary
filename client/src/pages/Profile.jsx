import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/userContext.jsx";
import "./styles.css";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useUser();
  const userID = user ? user._id : null;

  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Fetch User Data
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/user/profile/${userID}`);
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userID) {
      fetchUserData();
    }
  }, [userID]);

  // ✅ Handle File Click to Show Details
  const handleFileClick = (file) => {
    setSelectedFile(file);
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
          {userData ? (
            <>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Account Created:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Files Uploaded:</strong> {userData.files.length}</p>
            </>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>

        {/* ✅ Uploaded Files Section */}
        <div className="files-card">
          <h2>Uploaded Files</h2>
          {userData && userData.files.length > 0 ? (
            <ul>
              {userData.files.map((file, index) => (
                <li key={index}>
                  <p><strong>File Name:</strong> {file.fileName}</p>
                  <button onClick={() => handleFileClick(file)}>View Details</button>
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
            <p><strong>File Name:</strong> {selectedFile.fileName}</p>
            <p><strong>IPFS Link:</strong> 
              <a href={`https://gateway.pinata.cloud/ipfs/${selectedFile.encryptedFileCID}`} target="_blank" rel="noopener noreferrer">
                {selectedFile.encryptedFileCID}
              </a>
            </p>
            <p><strong>Key CID:</strong> {selectedFile.encryptionKeyCID}</p>
            <p><strong>Timestamp:</strong> {new Date(selectedFile.timestamp).toLocaleString()}</p>
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
