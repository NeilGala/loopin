
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

if (!DEPLOYER_PRIVATE_KEY) {
  console.warn("⚠️ WARNING: DEPLOYER_PRIVATE_KEY not set in .env");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: ALCHEMY_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [`0x${DEPLOYER_PRIVATE_KEY}`] : [],
      chainId: 11155111,
    },
  },

  // ✅ FIXED HERE
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
};