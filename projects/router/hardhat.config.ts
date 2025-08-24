import type { HardhatUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-web3'
import '@nomiclabs/hardhat-truffle5'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'dotenv/config'
import 'hardhat-tracer'
import '@nomicfoundation/hardhat-verify'
import 'solidity-docgen'
require('dotenv').config({ path: require('find-config')('.env') })

const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.devnet.doge.xyz",
  accounts: [process.env.KEY_DOGEOS_DEVNET!],
};

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    dogeOSDevNet
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
          apiURL: "https://blockscout.devnet.doge.xyz/api",
          browserURL: "https://blockscout.devnet.doge.xyz/",
        },
      }
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
      {
        version: '0.4.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
    ],
    overrides: {
      '@summitx/v3-core/contracts/libraries/FullMath.sol': {
        version: '0.7.6',
        settings: {},
      },
      '@summitx/v3-core/contracts/libraries/TickBitmap.sol': {
        version: '0.7.6',
        settings: {},
      },
      '@summitx/v3-core/contracts/libraries/TickMath.sol': {
        version: '0.7.6',
        settings: {},
      },
      '@summitx/v3-periphery/contracts/libraries/PoolAddress.sol': {
        version: '0.7.6',
        settings: {},
      },
      'contracts/libraries/PoolTicksCounter.sol': {
        version: '0.7.6',
        settings: {},
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  // abiExporter: {
  //   path: "./data/abi",
  //   clear: true,
  //   flat: false,
  // },
  docgen: {
    pages: 'files',
  },
}

export default config
