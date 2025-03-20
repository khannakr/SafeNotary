require("dotenv").config({ path: "../blockchain/.env" });  // Load blockchain env
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";  // Replace with actual contract address
const abi = [ /* Your Smart Contract ABI */ ];  // Replace with actual ABI

// Connect to Ethereum Sepolia Network
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, abi, signer);

// API to Store CID, ZKP & Timestamp in Smart Contract
app.post("/notarize", async (req, res) => {
    try {
        const { cid, zkp } = req.body;
        if (!cid || !zkp) {
            return res.status(400).json({ error: "CID and ZKP are required!" });
        }

        console.log("📩 Sending data to blockchain...");
        const tx = await contract.storeProof(cid, zkp, Math.floor(Date.now() / 1000));
        await tx.wait();
        console.log("✅ Data stored successfully! TX Hash:", tx.hash);

        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("❌ Blockchain Transaction Failed:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => console.log("🚀 Blockchain Server running on port 3001"));
