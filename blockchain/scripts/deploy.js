const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const FileNotarization = await hre.ethers.getContractFactory("FileNotarization");

  // IMPORTANT: Smart contracts are immutable once deployed
  console.log("📄 Deploying FileNotarization contract...");
  
  // Deploy the contract
  const fileNotarization = await FileNotarization.deploy();
  await fileNotarization.waitForDeployment();

  // Get contract address
  const contractAddress = fileNotarization.target || fileNotarization.address;
  console.log("✅ Contract deployed to:", contractAddress);
  console.log("⚠️ Update your contract address in interaction scripts!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
