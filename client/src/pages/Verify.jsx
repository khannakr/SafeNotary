import React, { useState } from "react";
import "./styles.css"; // Ensure your styles are linked correctly

const VerifyNotarization = () => {
  const [fileName, setFileName] = useState("");
  const [verificationResult, setVerificationResult] = useState("");

  const handleVerify = () => {
    // Simulate the verification process (you can replace this with your actual logic)
    if (fileName) {
    setVerificationResult(`Notarization details for the given file:${fileName}`);
    } else {
      setVerificationResult("No result to display.Enter a valid file to see notarization details.");
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

      {/* Verify Notarization Section */}
      <main className="verify-container">
        <div className="card">
          <h2>Verify Notarization</h2>
          <p>Enter the file name to verify the authenticity of your notarized file.</p>
          <label htmlFor="fileName">File Name /</label>
          <input
            type="text"
            id="fileName"
            name="fileName"
            placeholder="Enter file name"
            onChange={(e) => setFileName(e.target.value)}
            required
          />

          <button className="verify-btn" onClick={handleVerify}>Verify</button>
        </div>

        {/* Result Card */}
        <div className="result-card">
          <h3>Verification Result</h3>
          <p>{verificationResult || "No result to display. Enter a valid identifier to see notarization details."}</p>
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
