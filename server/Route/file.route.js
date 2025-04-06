import express from "express";
import File from "../model/file.model.js";
import { ethers, verifyMessage } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import { exec } from "child_process";
import path from "path"
import { fileURLToPath } from "url";
import User from "../model/auth.model.js";
import VerificationRequest from "../model/verificationRequest.model.js";
import { createDecipheriv } from "crypto";
import { create } from "domain";
dotenv.config({ path: "../blockchain/.env" });  // ✅ Load Ethereum environment variables

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 

// ✅ Initialize Ethereum connection
const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;



const zkeyPath = 'C:\\Users\\chand\\OneDrive\\Documents\\Desktop\\Projects\\SafeNotary\\ZKP\\squared_final.zkey';
const vkeyPath = 'C:\\Users\\chand\\OneDrive\\Documents\\Desktop\\Projects\\SafeNotary\\ZKP\\verification_key.json';
const proofsDir = path.join(__dirname, '..', '..', 'ZKP', 'proofs');
const wasmPath = 'C:\\Users\\chand\\OneDrive\\Documents\\Desktop\\Projects\\SafeNotary\\ZKP\\squared_js\\squared.wasm';
const witnessGenPath = 'C:\\Users\\chand\\OneDrive\\Documents\\Desktop\\Projects\\SafeNotary\\ZKP\\squared_js\\generate_witness.js';

// Ensure the proofs directory exists
if (!fs.existsSync(proofsDir)) {
    fs.mkdirSync(proofsDir, { recursive: true });
}


// ✅ ABI for the contract
const contractABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_fileName", "type": "string" },
      { "internalType": "string", "name": "_cid", "type": "string" },
      { "internalType": "string", "name": "_zkp", "type": "string" },
      { "internalType": "uint256", "name": "_timestamp", "type": "uint256" },
      { "internalType": "string", "name": "_verificationKey", "type": "string" }
    ],
    "name": "storeProof",
    "outputs": [],
    "stateMutability": "public",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_fileName", "type": "string" }],
    "name": "getFileProof",
    "outputs": [
      { "internalType": "string", "name": "fileName", "type": "string" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "string", "name": "zkp", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "string", "name": "verificationKey", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_verificationKey", "type": "string" }],
    "name": "getFileProofByVerificationKey",
    "outputs": [
      { "internalType": "string", "name": "fileName", "type": "string" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "string", "name": "zkp", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "string", "name": "verificationKey", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];


const contract = new ethers.Contract(contractAddress, contractABI, signer);

// 🔥 Store File in MongoDB & Ethereum - Update to include verification key
router.post("/new-file", async (req, res) => {
  try {
    const { userId, pdf_url, hash, encryptedFileCID, decryptionKey, filename, verificationKey } = req.body;

    // 🔥 Step 1: Generate ZKP first (as async operation)
    console.log("🔐 Generating Zero-Knowledge Proof...");
    const zkp = await generateProof(hash);
    console.log("✅ ZKP Generated:", zkp);
    
    // 🔥 Step 2: Store in MongoDB with the generated proof
    const newFile = new File({
      userId,
      pdf_url,
      hash,
      encryptedFileCID,
      decryptionKey,
      filename,
      zkp,
      verificationKey
    });

    await newFile.save();
    console.log("✅ File data saved to MongoDB");

    // 🔥 Step 3: Store on Ethereum with verification key
    const timestamp = Math.floor(Date.now() / 1000);  

    console.log("📩 Sending data to blockchain...");
    const tx = await contract.storeProof(filename, encryptedFileCID, zkp, timestamp, verificationKey);
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

router.get('/getfiles/:username', async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({name: username});
    if (!user) return res.status(404).send({ ok: false, message: "User not found" });
    const userId = user._id;
    console.log("User ID:", userId);
    const response = await File.find({ userId });
    const filteredFiles = response.map(file => {
      return {
        _id: file._id,
        filename: file.filename,
        pdf_url: file.pdf_url,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        userId: file.userId,
      };
    })
    
    res.send({ ok: true, files: filteredFiles });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, message: error.message });
  } 
});

// Route to handle verification key requests
router.post('/request-verification', async (req, res) => {
  try {
    const { fileId, fileName, requesterId, requesterName, ownerId, message } = req.body;
    
    // Check if the request already exists
    const existingRequest = await VerificationRequest.findOne({
      fileId,
      requesterId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).send({
        ok: false,
        message: "You already have a pending request for this file"
      });
    }
    
    // Create new verification request
    const newRequest = new VerificationRequest({
      fileId,
      fileName,
      requesterId,
      requesterName,
      ownerId,
      message
    });
    
    await newRequest.save();
    
    res.status(200).send({
      ok: true,
      message: "Verification key request submitted successfully",
      request: newRequest
    });
    
  } catch (error) {
    console.error("Error creating verification request:", error);
    res.status(500).send({
      ok: false,
      message: error.message
    });
  }
});

// Route to get all verification requests for a user
router.get('/verification-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await VerificationRequest.find({ ownerId: userId });
    
    // Get additional info for each request
    const requestsWithDetails = await Promise.all(requests.map(async (request) => {
      const file = await File.findById(request.fileId);
      return {
        ...request.toObject(),
        fileInfo: file ? {
          filename: file.filename,
          createdAt: file.createdAt
        } : null
      };
    }));
    
    res.status(200).send({
      ok: true,
      requests: requestsWithDetails
    });
    
  } catch (error) {
    console.error("Error fetching verification requests:", error);
    res.status(500).send({
      ok: false,
      message: error.message
    });
  }
});

// Route to get all verification requests made by the user (sent requests)
router.get('/sent-requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await VerificationRequest.find({ requesterId: userId });
    
    // Get additional info for each request
    const requestsWithDetails = await Promise.all(requests.map(async (request) => {
      const file = await File.findById(request.fileId);
      const owner = await User.findById(request.ownerId);
      return {
        ...request.toObject(),
        fileInfo: file ? {
          filename: file.filename,
          createdAt: file.createdAt
        } : null,
        ownerName: owner ? owner.name : 'Unknown User'
      };
    }));
    
    res.status(200).send({
      ok: true,
      requests: requestsWithDetails
    });
    
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).send({
      ok: false,
      message: error.message
    });
  }
});

// Route to update verification request status
router.put('/verification-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, message } = req.body;
    
    // Get the request first to access fileId
    const request = await VerificationRequest.findById(requestId);
    if (!request) {
      return res.status(404).send({
        ok: false,
        message: "Verification request not found"
      });
    }
    
    let updateData = { status, message };
    
    // If approving, get the verification key from the file and include it
    if (status === 'approved') {
      const file = await File.findById(request.fileId);
      if (!file) {
        return res.status(404).send({
          ok: false,
          message: "File not found"
        });
      }
      
      // Add verification key to the request
      console.log("File verification key:", file);
      
      updateData.verificationKey = file.verificationKey;
    }
    
    const updatedRequest = await VerificationRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );
    
    res.status(200).send({
      ok: true,
      message: `Request ${status}`,
      request: updatedRequest
    });
    
  } catch (error) {
    console.error("Error updating verification request:", error);
    res.status(500).send({
      ok: false,
      message: error.message
    });
  }
});

// ✅ Verification Route (Fetch from Ethereum)
router.get("/verify/:fileName", async (req, res) => {
  const { fileName } = req.params;

  console.log(`📦 Verifying file: ${fileName}...`);

  try {
    const fileResult = await File.find({filename: fileName});
    const result = await contract.getFileProof(fileName);
    const fileZkp = fileResult ?  fileResult[0].zkp : null;
    
    if (!result || result.length < 4 || !result[0] || !fileZkp) {
      return res.status(404).json({ valid: false, message: "File not found on blockchain" });
    }

    const [storedFileName, cid, zkp, timestamp] = result;

    if(zkp === fileZkp) {
      const convertedTimestamp = Number(timestamp);
      res.json({
        valid: true,
        fileName: storedFileName,
        cid,
        zkp,
        timestamp: new Date(convertedTimestamp * 1000).toISOString()
      });
    } else {
      res.json({
        valid: false,
        message: "File not verified"
    })
    }
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ valid: false, message: "Error retrieving file from blockchain" });
  }
});

// ✅ Verification by verification key
router.get("/verify-by-key/:verificationKey", async (req, res) => {
  const { verificationKey } = req.params;

  console.log(`📦 Verifying file with key: ${verificationKey}...`);

  try {
    // Try to get file from blockchain using verification key
    const result = await contract.getFileProofByVerificationKey(verificationKey);
    
    if (!result || result.length < 5 || !result[0]) {
      return res.status(404).json({ valid: false, message: "File not found on blockchain" });
    }

    const [storedFileName, cid, zkp, timestamp, storedVerificationKey] = result;
    
    // Also verify against MongoDB
    const fileResult = await File.findOne({ verificationKey: verificationKey });
    
    if (!fileResult) {
      return res.status(404).json({ valid: false, message: "File not found in database" });
    }

    // Verify that both blockchain and db data match
    if (fileResult.zkp === zkp && fileResult.filename === storedFileName) {
      const convertedTimestamp = Number(timestamp);
      res.json({
        valid: true,
        fileName: storedFileName,
        cid,
        zkp,
        timestamp: new Date(convertedTimestamp * 1000).toISOString(),
        verificationKey: storedVerificationKey
      });
    } else {
      res.json({
        valid: false,
        message: "File verification failed - data mismatch"
      });
    }
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ valid: false, message: "Error retrieving file from blockchain" });
  }
});

// Function to generate a proof from a hash - converted to Promise-based async function
function generateProof(hash) {
  return new Promise((resolve, reject) => {
    console.log('🔐 Submitting hash for proof generation...');
    
    try {
      if (!hash) {
        return reject(new Error('Hash value is required.'));
      }

      const inputPath = path.join(proofsDir, 'input.json');
      const outputPath = path.join(proofsDir, 'proof.json');
      const publicPath = path.join(proofsDir, 'public.json');
      const witnessPath = path.join(proofsDir, 'witness.wtns');

      // Use the consistent hash conversion function
      const numericHash = convertHashToNumeric(hash);
      
      // Write the properly formatted input to the file
      fs.writeFileSync(inputPath, JSON.stringify({ 
        secret: numericHash, 
        expectedHash: numericHash 
      }, null, 2));
      
      console.log(`✅ Hash converted and saved: ${numericHash}`);
      
      // Step 1: Generate witness using the circuit's generate_witness.js file
      const witnessCommand = `node "${witnessGenPath}" "${wasmPath}" "${inputPath}" "${witnessPath}"`;
      exec(witnessCommand, (witnessErr, witnessStdout, witnessStderr) => {
        if (witnessErr) {
          console.error('❌ Error during witness generation:', witnessStderr);
          return reject(new Error('Witness generation failed: ' + witnessStderr));
        }
        
        console.log('✅ Witness generated:', witnessStdout);
        
        // Step 2: Generate proof with deterministic entropy seed
        // Using part of the hash itself as the entropy seed ensures consistent results
        const entropySeed = hash.substring(0, 10);
        const proveCommand = `snarkjs groth16 prove "${zkeyPath}" "${witnessPath}" "${outputPath}" "${publicPath}" --entropy="${entropySeed}"`;
        exec(proveCommand, (err, stdout, stderr) => {
          if (err) {
            console.error('❌ Error during proof generation:', stderr);
            return reject(new Error('Proof generation failed: ' + stderr));
          }
          
          console.log('✅ Proof generated:', stdout);
          // Read and return the proof.json to frontend
          try {
            const proofData = fs.readFileSync(outputPath, 'utf8');
            console.log('Proof data:', proofData);
            resolve(proofData);
          } catch (readErr) {
            console.error('❌ Error reading proof file:', readErr);
            reject(new Error('Error reading proof file'));
          }
        });
      });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      reject(error);
    }
  });
}

// Helper function to ensure consistent hash conversion
function convertHashToNumeric(hash) {
    // If the hash is already a valid hex string, convert it to a decimal number as string
    if (/^0x[0-9a-f]+$/i.test(hash)) {
        try {
            // Modulo to keep the number within a reasonable range for the circuit
            return (BigInt(hash) % BigInt(2**64)).toString();
        } catch (e) {
            console.log('Error converting hex to BigInt, falling back to alternative method');
        }
    }
    
    // Consistent hashing approach: take the first 8 bytes and convert to number
    // This ensures the same hash always converts to the same numeric value
    let numericValue = 0;
    const bytesToUse = Math.min(8, hash.length);
    
    for (let i = 0; i < bytesToUse; i++) {
        numericValue = (numericValue * 256) + hash.charCodeAt(i);
    }
    
    return numericValue.toString();
}

// POST route to handle hash submission and proof generation
router.post('/submit-hash', (req, res) => {
  
    console.log('🔐 Submitting hash for proof generation...');
  
    try {
        const { hash } = req.body;
        if (!hash) {
            return res.status(400).json({ error: 'Hash value is required.' });
        }

        const inputPath = path.join(proofsDir, 'input.json');
        const outputPath = path.join(proofsDir, 'proof.json');
        const publicPath = path.join(proofsDir, 'public.json');
        const witnessPath = path.join(proofsDir, 'witness.wtns');

        // Use the consistent hash conversion function
        const numericHash = convertHashToNumeric(hash);
        
        // Write the properly formatted input to the file
        fs.writeFileSync(inputPath, JSON.stringify({ 
            secret: numericHash, 
            expectedHash: numericHash 
        }, null, 2));
        
        console.log(`✅ Hash converted and saved: ${numericHash}`);
        
        // Step 1: Generate witness using the circuit's generate_witness.js file
        const witnessCommand = `node "${witnessGenPath}" "${wasmPath}" "${inputPath}" "${witnessPath}"`;
        exec(witnessCommand, (witnessErr, witnessStdout, witnessStderr) => {
            if (witnessErr) {
                console.error('❌ Error during witness generation:', witnessStderr);
                return res.status(500).json({ error: 'Witness generation failed', details: witnessStderr });
            }
            
            console.log('✅ Witness generated:', witnessStdout);
            
            // Step 2: Generate proof with deterministic entropy seed
            // Using part of the hash itself as the entropy seed ensures consistent results
            const entropySeed = hash.substring(0, 10);
            const proveCommand = `snarkjs groth16 prove "${zkeyPath}" "${witnessPath}" "${outputPath}" "${publicPath}" --entropy="${entropySeed}"`;
            exec(proveCommand, (err, stdout, stderr) => {
                if (err) {
                    console.error('❌ Error during proof generation:', stderr);
                    return res.status(500).json({ error: 'Proof generation failed', details: stderr });
                }
                
                console.log('✅ Proof generated:', stdout);
                // Read and return the proof.json to frontend
                try {
                    const proofData = fs.readFileSync(outputPath, 'utf8');
                    const publicData = fs.readFileSync(publicPath, 'utf8');
                    
                    return res.status(200).json({
                        message: 'Proof generated successfully',
                        proof: JSON.parse(proofData),
                        public: JSON.parse(publicData)
                    });
                } catch (readErr) {
                    console.error('❌ Error reading proof file:', readErr);
                    return res.status(500).json({ error: 'Error reading proof file' });
                }
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



export default router;
