#!/usr/bin/env zx
// import 'zx/globals'

const networks = {
  eth: 'eth',
  goerli: 'goerli',
  bscMainnet: 'bscMainnet',
  bscTestnet: 'bscTestnet',
  hardhat: 'hardhat',
  baseCamp: 'baseCamp',
  camp: 'camp',
}

let network = process.env.NETWORK
console.log(network, 'network')
if (!network || !networks[network]) {
  throw new Error(`env NETWORK: ${network}`)
}

await $`yarn workspace @summitx/multicall3 run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @summitx/v2-core run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @summitx/v3-core run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @summitx/v3-periphery run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @summitx/smart-router run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @summitx/pool-creation-handler run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @summitx/masterchef-v3 run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @summitx/v3-lm-pool run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @summitx/pools run hardhat run scripts/verify.ts --network ${network}`


// await $`yarn workspace @summitx/lbp-masterchef-v3 run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @summitx/lbp-v3-lm-pool run hardhat run scripts/verify.ts --network ${network}`


console.log(chalk.blue('Done!'))
