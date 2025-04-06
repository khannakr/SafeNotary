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
        axios
          .get(`http://localhost:4000/api/file/get/${userID}`)
          .then((response) => {
            console.log(response);
            setFiles(response.data.files);
            console.log("Files: ", response.data.files);
          })
          .catch((error) => {
            console.error("Error fetching user files: ", error);
          });
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

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
        decryptedWordArray.words
          .map((word, i) =>
            i === decryptedWordArray.words.length - 1
              ? (word >> 24) & 0xff
              : [word >> 24, word >> 16, word >> 8, word]
          )
          .flat()
          .filter((_, i) => i < decrypted.sigBytes)
      );

      // 4. Convert to Blob
      const blob = new Blob([decryptedUint8Array], { type: "application/pdf" });

      // 5. Trigger file download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading or decrypting file:", error);
      alert("Failed to download or decrypt the file.");
    }
  };

  return (
    <div className="h-screen w-full">
      {/* ✅ Navbar */}
      <header>
        <nav className="navbar">
          <div className="logo">SafeNotary</div>
          <ul className="nav-links">
            <li>
              <Link to="/newhome" className="btn-action">
                Home
              </Link>
            </li>
            <li>
              <Link to="/upload" className="btn-action">
                Upload
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="mx-auto px-4 py-8 space-y-6 h-screen w-full flex flex-col gap-10">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full bg-red-500">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            Profile Information
          </h2>
          {user ? (
            <>
              <p className="py-2 border-b border-gray-100">
                <strong className="text-gray-700 mr-2">Name:</strong> {user.name}
              </p>
              <p className="py-2 border-b border-gray-100">
                <strong className="text-gray-700 mr-2">Email:</strong>{" "}
                {user.email}
              </p>
              <p className="py-2">
                <strong className="text-gray-700 mr-2">Account Created:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>

        {/* ✅ Uploaded Files Section */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
            Uploaded Files
          </h2>
          {files.length > 0 ? (
            <ul className="space-y-3">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="font-medium text-gray-700">
                      <span className="inline-block mr-2">
                        {file.filename.endsWith(".pdf")
                          ? "📕"
                          : file.filename.endsWith(".docx")
                          ? "📘"
                          : file.filename.endsWith(".txt")
                          ? "📄"
                          : "📁"}
                      </span>
                      {file.filename}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleFileClick(file)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-1.5 px-3 rounded-lg mr-2 text-sm transition-colors duration-200 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Details
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic py-4">No files uploaded yet.</p>
          )}
        </div>

        {/* ✅ File Details Section */}
        {selectedFile && (
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              File Details
            </h2>
            <p className="py-2 border-b border-gray-100">
              <strong className="text-gray-700 mr-2">File Name:</strong>{" "}
              {selectedFile.filename}
            </p>
            <p className="py-2">
              <strong className="text-gray-700 mr-2">Timestamp:</strong>{" "}
              {new Date(selectedFile.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12 text-center">
        <p>© 2025 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Profile;
