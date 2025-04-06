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
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('files');

  // ✅ Fetch User Data
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        if (!userID) return;
        
        const fileResponse = await axios.get(`http://localhost:4000/api/file/get/${userID}`);
        setFiles(fileResponse.data.files);
        
        // Fetch verification requests where user is the owner
        const receivedResponse = await axios.get(`http://localhost:4000/api/file/verification-requests/${userID}`);
        setReceivedRequests(receivedResponse.data.requests);
        
        // Fetch verification requests made by the user
        const sentResponse = await axios.get(`http://localhost:4000/api/file/sent-requests/${userID}`);
        setSentRequests(sentResponse.data.requests);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchFiles();
  }, [userID]);

  // ✅ Handle File Click to Show Details
  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  // Handle approve or reject verification request
  const handleVerificationResponse = async (requestId, status) => {
    try {
      const response = await axios.put(`http://localhost:4000/api/file/verification-request/${requestId}`, {
        status,
        message: status === 'approved' 
          ? 'Your request has been approved. You can now verify this file.'
          : 'Your request has been rejected.'
      });
      
      if (response.data.ok) {
        // Update the requests list
        setReceivedRequests(receivedRequests.map(req => 
          req._id === requestId ? {...req, status} : req
        ));
        alert(`Request ${status} successfully!`);
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update request status.");
    }
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

  // Function to download verification key as a file
  const handleDownloadKey = (fileName, verificationKey) => {
    // Create a text file with the verification key
    const fileContent = `Verification Key for ${fileName}:\n\n${verificationKey}`;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-key-${fileName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  console.log(sentRequests, "sentRequests");
  

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

      <main className="mx-auto px-4 py-8 space-y-6 h-full w-full flex flex-col gap-10">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
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

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex border-b mb-6 flex flex-row gap-10">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'files' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('files')}
            >
              My Files
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'received' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('received')}
            >
              Verification Requests 
              {receivedRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  {receivedRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'sent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('sent')}
            >
              My Requests
            </button>
          </div>

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div>
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
          )}

          {/* Received Verification Requests Tab */}
          {activeTab === 'received' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Verification Requests for Your Files
              </h2>
              
              {receivedRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Requester</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">File</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Date</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Message</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Status</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivedRequests.map((request, index) => (
                        <tr key={request._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-6 border-b">{request.requesterName}</td>
                          <td className="py-3 px-6 border-b">{request.fileName}</td>
                          <td className="py-3 px-6 border-b">{formatDate(request.createdAt)}</td>
                          <td className="py-3 px-6 border-b">{request.message || '-'}</td>
                          <td className="py-3 px-6 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-6 border-b">
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleVerificationResponse(request._id, 'approved')}
                                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleVerificationResponse(request._id, 'rejected')}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic py-4">No verification requests received.</p>
              )}
            </div>
          )}

          {/* Sent Verification Requests Tab */}
          {activeTab === 'sent' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                My Verification Requests
              </h2>
              
              {sentRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">File Owner</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">File</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Date</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Message</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Status</th>
                        <th className="py-3 px-6 border-b text-left text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentRequests.map((request, index) => (
                        <tr key={request._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-6 border-b">{request.ownerName}</td>
                          <td className="py-3 px-6 border-b">{request.fileName}</td>
                          <td className="py-3 px-6 border-b">{formatDate(request.createdAt)}</td>
                          <td className="py-3 px-6 border-b">{request.message || '-'}</td>
                          <td className="py-3 px-6 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-6 border-b">
                            {request.status === 'approved' && (
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input 
                                    type="text" 
                                    value={request.verificationKey} 
                                    readOnly
                                    className="bg-gray-50 text-xs rounded border px-2 py-1 w-32 truncate"
                                  />
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(request.verificationKey);
                                      alert('Verification key copied to clipboard!');
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                    title="Copy to clipboard"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                  </button>
                                </div>
                                <button 
                                  onClick={() => handleDownloadKey(request.fileName, request.verificationKey)}
                                  className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center font-medium transition-colors duration-200"
                                  title="Download key as file"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download Key
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic py-4">You haven't made any verification requests yet.</p>
              )}
            </div>
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
