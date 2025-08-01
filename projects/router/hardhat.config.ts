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
const fs = require("fs");
//const deployer = fs.readFileSync(".secret_testnet").toString().trim();
// const bscTestnet: NetworkUserConfig = {
//   url: 'https://rpc.ankr.com/bsc_testnet_chapel',
//   chainId: 97,
//   accounts: [process.env.KEY_TESTNET!],
// }

// const goerli: NetworkUserConfig = {
//   url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_API_KEY}`,
//   chainId: 5,
//   // accounts: [process.env.KEY_GOERLI!],
// }

// const bscMainnet: NetworkUserConfig = {
//   url: 'https://bsc-dataseed.binance.org/',
//   chainId: 56,
//   // accounts: [process.env.KEY_MAINNET!],
// }
const baseCamp: NetworkUserConfig = {
  url: "https://rpc.basecamp.t.raas.gelato.cloud",
  accounts: [process.env.KEY_BASE_CAMP!],

  
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
const sepolia: NetworkUserConfig = {
  url: "https://eth-sepolia.g.alchemy.com/v2/wUAOjtKSS75xfUEZah0k9ODHKHDC5PO0",
  chainId: 11155111,
  accounts: [process.env.KEY_SEPOLIA_TESTNET!],
};
const camp: NetworkUserConfig = {
  url: "https://rpc.camp.raas.gelato.cloud",
  gasPrice: "auto",
  accounts: [process.env.KEY_CAMP!],
};

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: {
        url: bscTestnet.url || '',
      },
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
    ...(process.env.KEY_BASE_CAMP && { baseCamp }),
    // goerli: goerli,
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
