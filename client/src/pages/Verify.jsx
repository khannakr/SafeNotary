import React, { useState } from "react";
import axios from "axios";
import "./styles.css"; // Ensure your styles are linked correctly

const VerifyNotarization = () => {
  const [fileName, setFileName] = useState("");
  const [verificationResult, setVerificationResult] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!fileName) {
      setVerificationResult("No result to display. Enter a valid file name.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.get(`http://localhost:4000/verify/${fileName}`);
      const { timestamp, valid } = data;

      setTimestamp(new Date(timestamp * 1000).toLocaleString());
      setIsValid(valid);
      setVerificationResult(valid ? "✅ File is valid" : "❌ File is invalid");

    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult("Verification failed. Please try again.");
      setIsValid(null);
      setTimestamp("");
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
        </div>

        {/* Result Card */}
        <div className="result-card">
          <h3>Verification Result</h3>
          {timestamp && (
            <>
              <p><strong>Timestamp:</strong> {timestamp}</p>
              <p><strong>Validity:</strong> {verificationResult}</p>
            </>
          )}
          {!timestamp && <p>{verificationResult || "No result to display. Enter a valid file name."}</p>}
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2024 SafeNotary. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default VerifyNotarization;