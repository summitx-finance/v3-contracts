/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-abi-exporter";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "solidity-docgen";
import "dotenv/config";

require("dotenv").config({ path: require("find-config")(".env") });
const fs = require("fs");
// const deployer = fs.readFileSync(".secret_testnet").toString().trim();

const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.devnet.doge.xyz",
  accounts: [process.env.KEY_DOGEOS_DEVNET || ''],
};

const config = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    dogeOSDevNet
    // testnet: bscTestnet,
    // mainnet: bscMainnet,
  },
  etherscan: {
    apiKey: {
      dogeOSDevnet: process.env.ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: "dogeOSDevNet",
        chainId: 10000,
        urls: {
          apiURL: "https://rpc.devnet.doge.xyz/api",
          browserURL: "https://rpc.devnet.doge.xyz",
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts/",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  docgen: {
    pages: "files",
  },
};

export default config;
