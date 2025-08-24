import { HardhatUserConfig } from 'hardhat/config'
import '@typechain/hardhat'
import 'dotenv/config'
import { NetworkUserConfig } from 'hardhat/types'
import 'solidity-docgen';
require('dotenv').config({ path: require('find-config')('.env') })
const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.devnet.doge.xyz",
  accounts: [process.env.KEY_DOGEOS_DEVNET || ''],
};


const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.6',
  },
  networks: {
    hardhat: {},
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
