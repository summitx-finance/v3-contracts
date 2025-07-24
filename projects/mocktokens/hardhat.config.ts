import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'
require('dotenv').config({ path: require('find-config')('.env') })
const fs = require("fs");
// const deployer = fs.readFileSync(".secret_testnet").toString().trim();
const DEFAULT_COMPILER_SETTINGS = {
  version: '0.5.16',
  settings: {
    // evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 2000,
    },
    // metadata: {
    //   bytecodeHash: 'none',
    // },
  },
}

const baseCamp: NetworkUserConfig = {
  url: "https://rpc.basecamp.t.raas.gelato.cloud",
  gasPrice: "auto",
  maxFeePerGas: "auto",
  maxPriorityFeePerGas: 1_000_000_000,
  
  accounts: [process.env.KEY_TESTNET!],
  
};
const bscTestnet: NetworkUserConfig = {
  url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
}

const bscMainnet: NetworkUserConfig = {
  url: 'https://bsc-dataseed.binance.org/',
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
}

const goerli: NetworkUserConfig = {
  url: 'https://rpc.ankr.com/eth_goerli',
  chainId: 5,
  accounts: [process.env.KEY_GOERLI!],
}

const eth: NetworkUserConfig = {
  url: 'https://eth.llamarpc.com',
  chainId: 1,
  accounts: [process.env.KEY_ETH!],
}

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
export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    ...(process.env.KEY_TESTNET && { mumbai }),
    ...(process.env.KEY_TESTNET && { baseCamp }),
    ...(process.env.KEY_TESTNET && { localhost }),
    ...(process.env.KEY_TESTNET && { bscTestnet }),
    ...(process.env.KEY_MAINNET && { bscMainnet }),
    ...(process.env.KEY_GOERLI && { goerli }),
    ...(process.env.KEY_ETH && { eth }),
    // mainnet: bscMainnet,
  },
  etherscan: {
    apiKey: {
      baseCamp: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      
    ],
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS]
  },
  watcher: {
    test: {
      tasks: [{ command: 'test', params: { testFiles: ['{path}'] } }],
      files: ['./test/**/*'],
      verbose: true,
    },
  },
  docgen: {
    pages: 'files',
  },
}
