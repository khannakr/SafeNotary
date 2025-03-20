const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const FileNotarization = await hre.ethers.getContractFactory("FileNotarization");

  // Deploy the contract
  const fileNotarization = await FileNotarization.deploy();
  await fileNotarization.waitForDeployment(); // ✅ Ensures the contract is fully deployed

  // ✅ Check if `target` or `address` works
  const contractAddress = fileNotarization.target || fileNotarization.address;
  console.log("✅ Contract deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
