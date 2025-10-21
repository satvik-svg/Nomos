import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hedera_testnet: {
      type: "http",
      url: "https://testnet.hashio.io/api",
      accounts: process.env.HEX_Encoded_Private_Key ? [process.env.HEX_Encoded_Private_Key] : [],
      chainId: 296,
      gasPrice: 530000000000, // 530 Gwei - Hedera minimum gas price
    },
    hedera_mainnet: {
      type: "http",
      url: "https://mainnet.hashio.io/api",
      accounts: process.env.HEX_Encoded_Private_Key ? [process.env.HEX_Encoded_Private_Key] : [],
      chainId: 295,
      gasPrice: 530000000000, // 530 Gwei - Hedera minimum gas price
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;