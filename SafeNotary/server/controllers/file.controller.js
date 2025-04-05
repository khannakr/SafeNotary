const FileController = {
  // Fetch the encrypted file from IPFS
  getEncryptedFile: async (req, res) => {
    const { filename } = req.params;

    try {
      // Logic to retrieve the encrypted file CID from MongoDB based on the filename
      const fileRecord = await FileModel.findOne({ filename });
      if (!fileRecord) {
        return res.status(404).json({ message: "File not found." });
      }

      const encryptedFileCID = fileRecord.encryptedFileCID;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${encryptedFileCID}`;

      return res.status(200).json({ ipfsUrl });
    } catch (error) {
      console.error("Error fetching encrypted file:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },

  // Fetch the decryption key from MongoDB
  getDecryptionKey: async (req, res) => {
    const { filename } = req.params;

    try {
      // Logic to retrieve the decryption key CID from MongoDB based on the filename
      const fileRecord = await FileModel.findOne({ filename });
      if (!fileRecord) {
        return res.status(404).json({ message: "File not found." });
      }

      const decryptionKeyCID = fileRecord.encryptionKeyCID;
      const decryptionKey = await fetchDecryptionKeyFromIPFS(decryptionKeyCID);

      return res.status(200).json({ decryptionKey });
    } catch (error) {
      console.error("Error fetching decryption key:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  }
};

// Helper function to fetch decryption key from IPFS
const fetchDecryptionKeyFromIPFS = async (cid) => {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  if (!response.ok) {
    throw new Error("Failed to fetch decryption key from IPFS.");
  }
  return await response.text();
};

export default FileController;