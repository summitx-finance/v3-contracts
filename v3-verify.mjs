#!/usr/bin/env zx
// import 'zx/globals'

const networks = {
  dogeOSDevNet: 'dogeOSDevNet',
}

let network = process.env.NETWORK
console.log(network, 'network')
if (!network || !networks[network]) {
  throw new Error(`env NETWORK: ${network}`)
}

await $`yarn workspace @muchfi/multicall3 run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @muchfi/v2-core run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @muchfi/v3-core run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @muchfi/v3-periphery run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @muchfi/smart-router run hardhat run scripts/verify.ts --network ${network}`

await $`yarn workspace @muchfi/pool-creation-handler run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @muchfi/masterchef-v3 run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @muchfi/v3-lm-pool run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @muchfi/pools run hardhat run scripts/verify.ts --network ${network}`


// await $`yarn workspace @muchfi/lbp-masterchef-v3 run hardhat run scripts/verify.ts --network ${network}`

// await $`yarn workspace @muchfi/lbp-v3-lm-pool run hardhat run scripts/verify.ts --network ${network}`


console.log(chalk.blue('Done!'))
