require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// Upload File to IPFS
async function uploadToIPFS(filePath) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    try {
        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY
            }
        });

        return response.data.IpfsHash; // Return CID of the uploaded file
    } catch (error) {
        console.error("❌ Error uploading to IPFS:", error);
        throw error;
    }
}

// API to Handle File Upload
app.post("/upload", async (req, res) => {
    try {
        const filePath = "C:\\path\\to\\your\\file.pdf"; // Replace with actual file path
        const cid = await uploadToIPFS(filePath);
        res.json({ success: true, cid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3002, () => console.log("📡 IPFS Server running on port 3002"));
