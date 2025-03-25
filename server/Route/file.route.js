import express from "express";
import File from "../model/file.model.js";
import { ethers, verifyMessage } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import { exec } from "child_process";
import path from "path"
import { fileURLToPath } from "url";
dotenv.config({ path: "../blockchain/.env" });  // ✅ Load Ethereum environment variables

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
    "inputs": [{ "internalType": "string", "name": "_fileName", "type": "string" }],
    "name": "getFileProof",
    "outputs": [
      { "internalType": "string", "name": "fileName", "type": "string" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "string", "name": "zkp", "type": "string" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
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

    generateProof(hash);

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

const zkeyPath = 'C:\\Users\\HP\\OneDrive\\Desktop\\safenotary_new\\ZKP\\squared_final.zkey';
const vkeyPath = 'C:\\Users\\chand\\OneDrive\\Documents\\Desktop\\Projects\\SafeNotary\\ZKP\\verification_key.json';
const proofsDir = path.join(__dirname, '..', '..', 'ZKP', 'proofs');
const wasmPath = 'C:\\Users\\HP\\OneDrive\\Desktop\\safenotary_new\\ZKP\\squared_js\\squared.wasm';
const witnessGenPath = 'C:\\Users\\HP\\OneDrive\\Desktop\\safenotary_new\\ZKP\\squared_js\\generate_witness.js';

// Ensure the proofs directory exists
if (!fs.existsSync(proofsDir)) {
    fs.mkdirSync(proofsDir, { recursive: true });
}

// Function to generate a proof from a hash
function generateProof(hash) {
    try {
        const inputPath = path.join(proofsDir, 'input.json');
        const witnessPath = path.join(proofsDir, 'witness.wtns');
        
        // Convert hash to a numeric format if it's not already
        // This assumes the circuit expects a numeric input
        let numericHash;
        
        try {
            // First try to convert directly to number if it's already numeric
            numericHash = BigInt(hash).toString();
        } catch (e) {
            // If hash is a string, convert to a simple numeric representation
            // Use a sum of character codes for simplicity
            numericHash = Array.from(hash).reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
        }
        
        // Write the properly formatted input to the file
        fs.writeFileSync(inputPath, JSON.stringify({ 
            secret: numericHash, 
            expectedHash: numericHash 
        }, null, 2));
        
        console.log(`✅ Hash converted and saved: ${numericHash}`);
        
        // This will run asynchronously in the background - you can implement proper callbacks if needed
        // Use the circuit's specific generate_witness.js file
        const witnessCommand = `node "${witnessGenPath}" "${wasmPath}" "${inputPath}" "${witnessPath}"`;
        exec(witnessCommand, (err, stdout, stderr) => {
            if (err) {
                console.error('❌ Error during witness generation:', stderr);
                return;
            }
            console.log('✅ Witness generated successfully');
            
            // Once witness is generated, create the proof
            const proveCommand = `snarkjs groth16 prove "${zkeyPath}" "${witnessPath}" "${path.join(proofsDir, 'proof.json')}" "${path.join(proofsDir, 'public.json')}"`;
            exec(proveCommand, (err, stdout, stderr) => {
                if (err) {
                    console.error('❌ Error during proof generation:', stderr);
                    return;
                }
                console.log('✅ Proof generated successfully');
            });
        });
    } catch (error) {
        console.error('❌ Error in generateProof:', error);
    }
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

        // Convert hash to a numeric format if it's not already
        let numericHash;
        
        try {
            // First try to convert directly to number if it's already numeric
            numericHash = BigInt(hash).toString();
        } catch (e) {
            // If hash is a string, convert to a simple numeric representation
            // Use a sum of character codes for simplicity
            numericHash = Array.from(hash).reduce((acc, char) => acc + char.charCodeAt(0), 0).toString();
        }
        
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
            
            // Step 2: Generate proof
            const proveCommand = `snarkjs groth16 prove "${zkeyPath}" "${witnessPath}" "${outputPath}" "${publicPath}"`;
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

                // Step 3: Verify proof
                // const verifyCommand = `snarkjs groth16 verify "${vkeyPath}" "${publicPath}" "${outputPath}"`;
                // exec(verifyCommand, (verifyErr, verifyStdout, verifyStderr) => {
                //     if (verifyErr) {
                //         console.error('❌ Error during verification:', verifyStderr);
                //         return res.status(500).json({ error: 'Proof verification failed', details: verifyStderr });
                //     }

                //     console.log('✅ Verification successful:', verifyStdout);
                //     return res.status(200).json({ message: 'Proof verified successfully', output: verifyStdout });
                // });
            });
        });
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



export default router;
