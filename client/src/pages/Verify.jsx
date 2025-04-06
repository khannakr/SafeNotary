import React, { useState } from "react";
import axios from "axios";
import "./styles.css"; // Ensure your styles are linked correctly

const VerifyNotarization = () => {
  const [verificationKey, setVerificationKey] = useState("");
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    let isValid = true;
    let errorMsg = "";

    if (!verificationKey) {
      isValid = false;
      errorMsg = "Please enter a valid verification key.";
    }
    
    if (!isValid) {
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError("");
    setFileData(null);

    try {
      const { data } = await axios.get(`http://localhost:4000/api/file/verify-by-key/${verificationKey}`);
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
      <nav className="navbar">
        <div className="logo">SafeNotary</div>
        <ul className="nav-links">
          <li><a href="/newhome" className="btn-action">Home</a></li>
        </ul>
      </nav>

      {/* Verify Notarization Section */}
      <main className="verify-container">
        <div className="card">
          <h2>Verify Notarization</h2>
          <p>Verify the authenticity of your notarized file by verification key.</p>

          <div className="input-group">
            <label htmlFor="verificationKey">Verification Key:</label>
            <input
              type="text"
              id="verificationKey"
              name="verificationKey"
              placeholder="Enter verification key"
              value={verificationKey}
              onChange={(e) => setVerificationKey(e.target.value)}
              required
            />
          </div>

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
            <p><strong>Timestamp:</strong> {new Date(fileData.timestamp).toLocaleString()}</p>
            <p><strong>Validity:</strong> {fileData.valid ? "✅ Valid" : "❌ Invalid"}</p>
            
            {/* {fileData.valid && fileData.verificationKey && (
              <p><strong>Verification Key:</strong> {fileData.verificationKey}</p>
            )} */}
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
