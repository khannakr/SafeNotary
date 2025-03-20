const { ethers } = require("hardhat");
require("dotenv").config();

// 🔹 Your deployed contract address
const contractAddress = "0x86ebbc438a61ff05c58839e257276fac4365b4de";   // Update with your deployed contract address

// 🔹 Your MetaMask wallet address (for interaction)
const walletAddress = "0xFa4ec7C312E32319b54BD42af2D90b2FF69c9c8d";  // Replace with your wallet address

// 🔹 CID, ZKP, and Timestamp to store
const cid = "QmXyz123...";    // Replace with your IPFS CID
const zkp = "ZKP12345...";     // Replace with your ZKP
const timestamp = Math.floor(Date.now() / 1000);  // Current timestamp in seconds

async function main() {
  console.log("🔗 Connecting to the contract...");

  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const contract = new ethers.Contract(contractAddress, [
    "function storeProof(string memory _cid, string memory _zkp, uint256 _timestamp) public",
    "function getFileProof(string memory _cid) public view returns (string memory, string memory, uint256)"
  ], wallet);

  // 🔹 Store the Proof on Ethereum
  console.log("\n📦 Storing ZKP, CID, and timestamp on Ethereum...");
  const tx = await contract.storeProof(cid, zkp, timestamp);
  console.log("⏳ Waiting for transaction confirmation...");
  await tx.wait();
  console.log(`✅ Transaction successful! Hash: ${tx.hash}`);

  // 🔹 Retrieve the stored data for verification
  console.log("\n🔍 Retrieving stored data...");
  const storedData = await contract.getFileProof(cid);
  
  console.log("\n📄 Stored CID: ", storedData[0]);
  console.log("🔑 Stored ZKP: ", storedData[1]);
  console.log("⏱️ Stored Timestamp: ", new Date(storedData[2] * 1000).toISOString());
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
