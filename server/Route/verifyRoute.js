import express from "express";
import { ethers } from "ethers";
import axios from "axios";
import dotenv from "dotenv";
import CryptoJS from "crypto-js";

dotenv.config();

const router = express.Router();

// Ethereum configuration
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);

// Contract ABI
const abi = [
  "function getFileProof(string memory _fileName) public view returns (string memory, string memory, string memory, uint256)"
];

const contract = new ethers.Contract(contractAddress, abi, signer);

// 🔥 Route to verify file notarization
router.get("/:fileName", async (req, res) => {
  const { fileName } = req.params;

  try {
    console.log(`🔍 Verifying file: ${fileName}...`);

    // 1️⃣ Fetch notarization data from the blockchain
    const [storedFileName, cid, zkp, timestamp] = await contract.getFileProof(fileName);

    if (!storedFileName) {
      return res.status(500).json({ message: "File not found" });
    }

    console.log("✅ Fetched notarization data:", { cid, zkp, timestamp });

    // 2️⃣ Download the encrypted file from IPFS
    const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
    const ipfsResponse = await axios.get(ipfsUrl, { responseType: "arraybuffer" });

    const encryptedFile = ipfsResponse.data;

    // 3️⃣ Recalculate the hash of the encrypted file
    const wordArray = CryptoJS.lib.WordArray.create(encryptedFile);
    const recalculatedHash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

    console.log("🔐 Recalculated hash:", recalculatedHash);

    // 4️⃣ Verify the ZKP (simplified check)
    const isValid = zkp === recalculatedHash; // Replace this with your actual ZKP verification logic

    console.log("🛠️ Verification:", isValid ? "VALID" : "INVALID");

    res.json({
      fileName: storedFileName,
      timestamp: new Date(timestamp * 1000).toISOString(),
      isValid
    });

  } catch (error) {
    console.error("❌ Error verifying file:", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

export default router;
