import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Smart contract details
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = [
    "function getFileByName(string memory _fileName) public view returns (string memory, string memory, string memory, uint256)"
];

router.get("/fetch-data/:fileName", async (req, res) => {
    const { fileName } = req.params;

    try {
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        console.log(`Fetching data for File Name: ${fileName}...`);

        // Fetch CID, ZKP, and timestamp
        const [fetchedFileName, Cid, zkp, timestamp] = await contract.getFileByName(fileName);

        // Format response
        const responseData = {
            fileName: fetchedFileName,
            cid: Cid,
            zkp: zkp,
            timestamp: new Date(timestamp * 1000).toLocaleString()
        };

        console.log("Data fetched:", responseData);

        res.status(200).json(responseData);

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

export default router;
