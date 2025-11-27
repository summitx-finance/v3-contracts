import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { NetworkUserConfig } from 'hardhat/types'

require('dotenv').config({ path: require('find-config')('.env') })

const baseCamp: NetworkUserConfig = {
  url: "https://rpc.basecamp.t.raas.gelato.cloud",
  gasPrice: "auto",
  accounts: [process.env.KEY_TESTNET!],
};

const megaethTestnetV2: NetworkUserConfig = {
  url: "https://timothy.megaeth.com/rpc",
  chainId: 6343,
  accounts: [process.env.KEY_MEGA_ETH_TESTNET_V2!],
  gas: 9999999,
  gasPrice: 2000000,
};

const camp: NetworkUserConfig = {
  url: "https://rpc.camp.raas.gelato.cloud",
  accounts: [process.env.KEY_CAMP!],
}


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
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    baseCamp: baseCamp,
    megaethTestnetV2: megaethTestnetV2,
    camp: camp,
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  etherscan: {
    apiKey: {
      baseCamp: process.env.ETHERSCAN_API_KEY,
      camp: process.env.ETHERSCAN_API_KEY,
      megaethTestnetV2: process.env.ETHERSCAN_API_KEY,
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
      {
        network: "megaethTestnetV2",
        chainId: 6343,
        urls: {
          apiURL: "https://megaeth-testnet.explorer.caldera.xyz/api",
          browserURL: "https://megaeth-testnet.explorer.caldera.xyz/",
        },
      },
    ],
  },
}

export default config