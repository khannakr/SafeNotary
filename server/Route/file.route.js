import express from "express";
import File from "../model/file.model.js";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: "../blockchain/.env" });  // ✅ Load Ethereum environment variables

const router = express.Router();

// Initialize Ethereum connection
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

// ABI for the contract
const abi = [
  "function storeProof(string memory _fileName, string memory _cid, string memory _zkp, uint256 _timestamp) public",
];

const contract = new ethers.Contract(contractAddress, abi, signer);

// 🔥 Store File in MongoDB & Ethereum
router.post("/new-file", async (req, res) => {
  try {
    const { userId, pdf_url, hash, encryptedFileCID, decryptionKey, filename } = req.body;

    // 🔥 Step 1: Store in MongoDB
    const newFile = new File({
      userId,
      pdf_url,
      hash,
      encryptedFileCID,
      decryptionKey,
      filename
    });

    await newFile.save();

    // 🔥 Step 2: Store on Ethereum
    const timestamp = Math.floor(Date.now() / 1000);  // Get current timestamp

    console.log("📩 Sending data to blockchain...");
    
    const tx = await contract.storeProof(filename, encryptedFileCID, hash, timestamp);
    await tx.wait();
    console.log("✅ Data stored successfully on Ethereum! TX Hash:", tx.hash);

    res.send({
      ok: true,
      file: newFile,
      txHash: tx.hash,
      message: "File successfully notarized on Ethereum!"
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send({ ok: false, message: error.message });
  }
});

// 🔥 Retrieve Files from MongoDB
router.get('/get/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const response = await File.find({ userId });
    res.send({ ok: true, files: response });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: error.message });
  }
});

export default router;
