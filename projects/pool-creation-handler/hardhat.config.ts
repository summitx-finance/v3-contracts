import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { NetworkUserConfig } from 'hardhat/types'

require('dotenv').config({ path: require('find-config')('.env') })

const dogeOSTestNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_TESTNET!],
};
const dogeOSDevNet: NetworkUserConfig = {
  url: "https://rpc.testnet.dogeos.com",
  accounts: [process.env.KEY_DOGEOS_DEVNET!],
};


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {},
    dogeOSDevNet,
    dogeOSTestNet
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
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
}

export default config