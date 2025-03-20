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
        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMDdkNDAxNy00MDg0LTQ1OWQtOTdlZi1hMzI5MmFjMDNkNGEiLCJlbWFpbCI6ImRpbHByaXlhdGtAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjdjYWFjZTFiZDFjNDhkZTNhZDkyIiwic2NvcGVkS2V5U2VjcmV0IjoiNWZlM2U3NmQ2YmZkODdmZTJmNWZiMDc2NjNlNDZlMTIxZmIyMWIwMGZmZjdkYTVkYTJkOWU0MWRhNGE3NDlhMiIsImV4cCI6MTc3MzczMzk1Nn0.t6GyAe2bwtjih7mJCz1FR2sgoug3pftBCxj6a_a6kpI`, // Replace with your API Key
            },
          }
        );
        return response.data.IpfsHash;
      } catch (error) {
        console.error("IPFS upload error:", error);
        return null;
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
