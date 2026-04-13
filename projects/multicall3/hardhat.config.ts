import type { NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'
require('dotenv').config({ path: require('find-config')('.env') })

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.8.12',
  settings: {
    optimizer: {
      enabled: true,
      runs: 20,
    },
    
  },
}

const dogeOSTestNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_TESTNET!],
};
const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_DEVNET || ''],
};

const camp: NetworkUserConfig = {
  url: "https://rpc.camp.raas.gelato.cloud",
  gasPrice: "auto",
  accounts: [process.env.KEY_CAMP!],
};


export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    dogeOSDevNet,
    dogeOSTestNet
  },
  etherscan: {
    apiKey: {
        dogeOSDevnet: process.env.ETHERSCAN_API_KEY || '',
    },
    customChains: [
      
      {
        network: "dogeOSDevnet",
        chainId: 221122420,
        urls: {
          apiURL: "https://blockscout.testnet.dogeos.com/api",
          browserURL: "https://blockscout.testnet.dogeos.com/",
        },
      },
      
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
