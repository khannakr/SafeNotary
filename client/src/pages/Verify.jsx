import React, { useState } from "react";
import axios from "axios";
import "./styles.css"; // Ensure your styles are linked correctly

const VerifyNotarization = () => {
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!fileName) {
      setError("Please enter a valid file name.");
      return;
    }

    setLoading(true);
    setError("");
    setFileData(null);

    try {
      const { data } = await axios.get(`http://localhost:4000/api/file/verify/${fileName}`);
      console.log("Verification Data:", data);

      // Display the returned data
      setFileData(data);

    } catch (error) {
      console.error("Verification failed:", error);
      setError("Verification failed. Please try again.");
    }

    setLoading(false);
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

      {/* Verify Notarization Section */}
      <main className="verify-container">
        <div className="card">
          <h2>Verify Notarization</h2>
          <p>Enter the file name to verify the authenticity of your notarized file.</p>

          <label htmlFor="fileName">File Name:</label>
          <input
            type="text"
            id="fileName"
            name="fileName"
            placeholder="Enter file name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
          />

          <button className="verify-btn" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Display Verification Result */}
        {fileData && (
          <div className={`result-card ${fileData.valid ? "valid" : "invalid"}`}>
            <h3>Verification Result</h3>
            
            <p><strong>File Name:</strong> {fileData.fileName}</p>
            {/* <p><strong>CID:</strong> <a href={`https://ipfs.io/ipfs/${fileData.cid}`} target="_blank" rel="noopener noreferrer">{fileData.cid}</a></p> */}
            {/* <p><strong>ZKP:</strong> {fileData.zkp}</p> */}
            <p><strong>Timestamp:</strong> {new Date(fileData.timestamp).toLocaleString()}</p>
            <p><strong>Validity:</strong> {fileData.valid ? "✅ Valid" : "❌ Invalid"}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <p>© 2025 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default VerifyNotarization;
