require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // ✅ Load .env file

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_URL || "", // ✅ Prevents undefined URL error
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // ✅ Prevents undefined account error
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "", // ✅ Prevents undefined API key error
  },
};
