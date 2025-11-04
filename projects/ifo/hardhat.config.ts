/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";
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

const baseCamp: NetworkUserConfig = {
  url: "https://rpc.basecamp.t.raas.gelato.cloud",
  gasPrice: "auto",
  maxFeePerGas: "auto",
  maxPriorityFeePerGas: 1_000_000_000,
  
  accounts: [process.env.KEY_TESTNET!],
};
const bscTestnet: NetworkUserConfig = {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
};

const sepolia: NetworkUserConfig = {
  url: "https://eth-sepolia.g.alchemy.com/v2/wUAOjtKSS75xfUEZah0k9ODHKHDC5PO0",
  chainId: 11155111,
  accounts: [process.env.KEY_SEPOLIA_TESTNET!],
};

const bscMainnet: NetworkUserConfig = {
  url: "https://bsc-dataseed.binance.org/",
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
};

const goerli: NetworkUserConfig = {
  url: "https://rpc.ankr.com/eth_goerli",
  chainId: 5,
  accounts: [process.env.KEY_GOERLI!],
};

const eth: NetworkUserConfig = {
  url: "https://eth.llamarpc.com",
  chainId: 1,
  accounts: [process.env.KEY_ETH!],
};

const localhost: NetworkUserConfig = {
  url: "HTTP://127.0.0.1:7545",
  chainId: 5777,
  accounts: [process.env.KEY_TESTNET!],
};

const mumbai: NetworkUserConfig = {
  url: "https://rpc-mumbai.maticvigil.com",
  chainId: 80001,
  accounts: [process.env.KEY_TESTNET!],
};

const config = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    ...(process.env.KEY_TESTNET && { mumbai }),
    ...(process.env.KEY_SEPOLIA_TESTNET && { sepolia }),
   ...(process.env.KEY_BASE_CAMP && { baseCamp }),
    ...(process.env.KEY_TESTNET && { baseCamp }),
    ...(process.env.KEY_BASE_CAMP && { baseCamp }),
    ...(process.env.KEY_TESTNET && { localhost }),
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    // testnet: bscTestnet,
    // mainnet: bscMainnet,
  },
  etherscan: {
    apiKey: {
      baseCamp: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      
      {
        network: "baseCamp",
        chainId: 123420001114,
        urls: {
          apiURL: "https://basecamp.cloud.blockscout.com/api",
          browserURL: "https://basecamp.cloud.blockscout.com/",
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
            runs: 9999,
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
