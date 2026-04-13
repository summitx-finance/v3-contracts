import { HardhatUserConfig } from 'hardhat/config'
import '@typechain/hardhat'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'
import 'solidity-docgen';
require('dotenv').config({ path: require('find-config')('.env') })
const dogeOSTestNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_TESTNET!],
};
const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_DEVNET || ''],
};


const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
  },
  networks: {
    hardhat: {},
    dogeOSDevNet,
    dogeOSTestNet
  },
  etherscan: {
    apiKey: {
      dogeOSDevnet: process.env.ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: "dogeOSTestNet",
        chainId: 6281971,
        urls: {
          apiURL: "https://blockscout.testnet.doge.xyz/api",
          browserURL: "https://blockscout.testnet.doge.xyz/",
        },
      },
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
  paths: {
    sources: './contracts/',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
}

export default config
