import express from "express";
import File from "../model/file.model.js";
import { ethers, verifyMessage } from "ethers";
import dotenv from "dotenv";

dotenv.config({ path: "../blockchain/.env" });  // ✅ Load Ethereum environment variables

const router = express.Router();

// ✅ Initialize Ethereum connection
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

// ✅ ABI for the contract
// const abi = [
//   "function storeProof(string memory _fileName, string memory _cid, string memory _zkp, uint256 _timestamp) public"
// ];


const contractABI = [
  {
      "inputs": [{"internalType": "string", "name": "_fileName", "type": "string"}],
      "name": "getFileProof",
      "outputs": [
          {"internalType": "string", "name": "fileName", "type": "string"},
          {"internalType": "string", "name": "cid", "type": "string"},
          {"internalType": "string", "name": "zkp", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
  }
];
const contract = new ethers.Contract(contractAddress, contractABI, signer);

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

  console.log(tx);

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

// ✅ Verification Route (Fetch from Ethereum)

router.get("/verify/:fileName", async (req, res) => {
  const { fileName } = req.params;

  console.log(`📦 Verifying file: ${fileName}...`);

  try {
      const result = await contract.getFileProof(fileName);

      if (!result || result.length < 4 || !result[0]) {
          return res.status(404).json({ valid: false, message: "File not found on blockchain" });
      }

      const [storedFileName, cid, zkp, timestamp] = result;

      // ✅ Explicitly convert BigInt to Number
      const convertedTimestamp = Number(timestamp);

      res.json({
          valid: true,
          fileName: storedFileName,
          cid,
          zkp,
          timestamp: new Date(convertedTimestamp * 1000).toISOString()
      });

  } catch (error) {
      console.error("❌ Verification Error:", error);
      res.status(500).json({ valid: false, message: "Error retrieving file from blockchain" });
  }
});


export default router;
