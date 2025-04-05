import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/userContext.jsx";
import "./styles.css";
import { Link } from "react-router-dom";
import FileDecryptor from "../components/FileDecryptor.jsx";

const Profile = () => {
  const { user } = useUser();
  const userID = user ? user._id : null;

  const [userData, setUserData] = useState(user);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/file/get/${userID}`);
        setFiles(response.data.files);
      } catch (error) {
        console.error("Error fetching user files: ", error);
      }
    };

    fetchFiles();
  }, [userID]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  return (
    <div>
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

        <div className="files-card">
          <h2>Uploaded Files</h2>
          {files.length > 0 ? (
            <ul>
              {files.map((file, index) => (
                <li key={index}>
                  <p><strong>File Name:</strong> {file.filename}</p>
                  <button onClick={() => handleFileClick(file)}>Download & Decrypt</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded yet.</p>
          )}
        </div>

        {selectedFile && (
          <FileDecryptor file={selectedFile} />
        )}
      </main>

      <footer>
        <p>© 2025 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Profile;