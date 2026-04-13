import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-watcher'
import 'dotenv/config'
import 'solidity-docgen'
require('dotenv').config({ path: require('find-config')('.env') })
const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    // evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 20,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    //evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 20,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
   // evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 20,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const dogeOSTestNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_TESTNET!],
};
const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_DEVNET!],
}


export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true, // Only for local testing
    },
    dogeOSDevNet,
    dogeOSTestNet,
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
          apiURL: "https://blockscout.testnet.dogeos.com/api",
          browserURL: "https://blockscout.testnet.dogeos.com/",
        },
      }
    ],
  },
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
    overrides: {
      'contracts/MuchFiV3Pool.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/MuchFiV3PoolDeployer.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'contracts/test/OutputCodeHash.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
    },
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
