import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { useUser } from "../context/userContext.jsx";
import { decryptFile } from "../utils/decryption.js";

const FileDecryptor = ({ file }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!user) {
      setError("User not authenticated.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const encryptedFileCID = file.encryptedFileCID;
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${encryptedFileCID}`, {
        responseType: "arraybuffer",
      });

      const decryptionKeyCID = file.encryptionKeyCID;
      const keyResponse = await axios.get(`http://localhost:4000/api/file/key/${decryptionKeyCID}`);
      const decryptionKey = keyResponse.data.key;

      const decryptedFile = await decryptFile(response.data, decryptionKey);

      const blob = new Blob([decryptedFile], { type: "application/pdf" });
      saveAs(blob, file.filename);
    } catch (err) {
      console.error("Error during file decryption/download:", err);
      setError("Failed to download or decrypt the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleDownload} disabled={loading}>
        {loading ? "Downloading..." : "Download & Decrypt"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileDecryptor;