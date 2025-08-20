#!/usr/bin/env zx
// import 'zx/globals'

const networks = {
  eth: 'eth',
  goerli: 'goerli',
  bscMainnet: 'bscMainnet',
  bscTestnet: 'bscTestnet',
  hardhat: 'hardhat',
  localhost: 'localhost',
  mumbai: 'mumbai',
  baseCamp: 'baseCamp',
}

let network = process.env.NETWORK
console.log(network, 'network')
if (!network || !networks[network]) {
  throw new Error(`env NETWORK: ${network}`)
}

// await $`yarn workspace @summitx/mocktokens run hardhat run scripts/deploy.ts --network ${network}`

// await $`yarn workspace @summitx/multicall3 run hardhat run scripts/deploy.ts --network ${network}`

// Deploy core contracts first
//await $`yarn workspace @summitx/v2-core run hardhat run scripts/deploy.ts --network ${network}`

// await $`yarn workspace @summitx/v3-core run hardhat run scripts/deploy.ts --network ${network}`

// await $`yarn workspace @summitx/v3-periphery run hardhat run scripts/deploy2.ts --network ${network}`

// await $`yarn workspace @summitx/smart-router run hardhat run scripts/deploy2.ts --network ${network}`

// Deploy and configure PoolCreationHandler at the end
// console.log(chalk.yellow('\nDeploying and configuring PoolCreationHandler...'))
await $`yarn workspace @summitx/pool-creation-handler run hardhat run scripts/deploy-and-setup.ts --network ${network}`

// await $`yarn workspace @summitx/masterchef-v3 run hardhat run scripts/deploy2.ts --network ${network}`

// await $`yarn workspace @summitx/v3-lm-pool run hardhat run scripts/deploy2.ts --network ${network}`

// await $`yarn workspace @summitx/lbp-masterchef-v3 run hardhat run scripts/deploy2.ts --network ${network}`

// await $`yarn workspace @summitx/lbp-v3-lm-pool run hardhat run scripts/deploy2.ts --network ${network}`

// await $`yarn workspace @summitx/ifo run hardhat run scripts/deploy.ts --network ${network}`

console.log(chalk.blue('Done!'))

//const mocktokens = await fs.readJson(`./projects/mocktokens/deployments/${network}.json`)
const multiCall3 = await fs.readJson(`./projects/multicall3/deployments/${network}.json`)
const v2 = await fs.readJson(`./projects/v2-core/deployments/${network}.json`)
const r = await fs.readJson(`./projects/router/deployments/${network}.json`)
const c = await fs.readJson(`./projects/v3-core/deployments/${network}.json`)
const p = await fs.readJson(`./projects/v3-periphery/deployments/${network}.json`)

// Include PoolCreationHandler deployment
let handler = {}
try {
  handler = await fs.readJson(`./projects/pool-creation-handler/deployments/${network}.json`)
} catch (e) {
  console.log(chalk.yellow('PoolCreationHandler not found in deployments'))
}
// const i = await fs.readJson(`./projects/ifo/deployments/${network}.json`)
//const m = await fs.readJson(`./projects/masterchef-v3/deployments/${network}.json`)
//const l = await fs.readJson(`./projects/v3-lm-pool/deployments/${network}.json`)

// const lbpMasterChefV3 = await fs.readJson(`./projects/lbp-masterchef-v3/deployments/${network}.json`)

// const lbpLMPool = await fs.readJson(`./projects/lbp-v3-lm-pool/deployments/${network}.json`)

const addresses = {
  // ...mocktokens,
  ...multiCall3,
  ...v2,
  ...r,
  ...c,
  ...p,
  PoolCreationHandler: handler.PoolCreationHandler || '',
  // ...m,
  // ...l,
    // ...lbpMasterChefV3,
    // ...lbpLMPool,
    // ...i,
}

console.log(chalk.blue('Writing to file...'))
console.log(chalk.yellow(JSON.stringify(addresses, null, 2)))

fs.writeJson(`./deployments/${network}.json`, addresses, { spaces: 2 })
