import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'
require('dotenv').config({ path: require('find-config')('.env') })

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.5.16',
  settings: {
    optimizer: {
      enabled: true,
      runs: 2000,
    },
  },
}

const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.devnet.doge.xyz",
  accounts: [process.env.KEY_DOGEOS_DEVNET!],
  
};


export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    dogeOSDevNet
  },
  etherscan: {
    apiKey: {
      dogeOSDevnet: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "dogeOSDevnet",
        chainId: 221122420,
        urls: {
          apiURL: "https://blockscout.devnet.doge.xyz/api",
          browserURL: "https://blockscout.devnet.doge.xyz/",
        },
      }
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
