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
const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.6.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 200,
    },
    // metadata: {
    //   bytecodeHash: 'none',
    // },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.5.16',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 200,
    },
    // metadata: {
    //   bytecodeHash: 'none',
    // },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    // evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    // metadata: {
    //   bytecodeHash: 'none',
    // },
  },
}
const COMPILER_SETTINGS_8_0 = {
  version: '0.8.3',
  settings: {
    // evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    // metadata: {
    //   bytecodeHash: 'none',
    // },
  },
}
const baseCamp: NetworkUserConfig = {
  url: "https://rpc.basecamp.t.raas.gelato.cloud",
  gasPrice: "auto",
  maxFeePerGas: "1_000_000_000",
  maxPriorityFeePerGas: 1_000_000_000,
  accounts: [process.env.KEY_TESTNET!],
};

const camp: NetworkUserConfig = {
  url: "https://rpc.camp.raas.gelato.cloud",
  gasPrice: "auto",
  accounts: [process.env.KEY_CAMP!],
};

const bscTestnet: NetworkUserConfig = {
  url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  chainId: 97,
  accounts: [process.env.KEY_TESTNET!],
  gasPrice: 10_000_000_000 // 10 gwei
}

const bscMainnet: NetworkUserConfig = {
  url: 'https://bsc-dataseed.binance.org/',
  chainId: 56,
  accounts: [process.env.KEY_MAINNET!],
  gasPrice: 10_000_000_000
}

const goerli: NetworkUserConfig = {
  url: 'https://rpc.ankr.com/eth_goerli',
  chainId: 5,
  accounts: [process.env.KEY_GOERLI!],
  gasPrice: 10_000_000_000
}

const eth: NetworkUserConfig = {
  url: 'https://eth.llamarpc.com',
  chainId: 1,
  accounts: [process.env.KEY_ETH!],
  gasPrice: 10_000_000_000
}

const localhost: NetworkUserConfig = {
  url: "HTTP://127.0.0.1:7545",
  chainId: 5777,
  accounts: [process.env.KEY_TESTNET!],
  gasPrice: 10_000_000_000
};
const mumbai: NetworkUserConfig = {
  url: "https://rpc-mumbai.maticvigil.com",
  chainId: 80001,
  accounts: [process.env.KEY_TESTNET!],
};

const sepolia: NetworkUserConfig = {
  url: "https://eth-sepolia.g.alchemy.com/v2/wUAOjtKSS75xfUEZah0k9ODHKHDC5PO0",
  chainId: 11155111,
  accounts: [process.env.KEY_SEPOLIA_TESTNET!],
};

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    ...(process.env.KEY_CAMP && { camp }),
    ...(process.env.KEY_TESTNET && { mumbai }),
    ...(process.env.KEY_SEPOLIA_TESTNET && { sepolia }),
   ...(process.env.KEY_BASE_CAMP && { baseCamp }),
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
      camp: process.env.ETHERSCAN_API_KEY,
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
      {
        network: "camp",
        chainId: 484,
        urls: {
          apiURL: "https://camp.cloud.blockscout.com/api",
          browserURL: "https://camp.cloud.blockscout.com/",
        },
      },
    ],
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS, LOWEST_OPTIMIZER_COMPILER_SETTINGS, LOW_OPTIMIZER_COMPILER_SETTINGS, COMPILER_SETTINGS_8_0]
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
