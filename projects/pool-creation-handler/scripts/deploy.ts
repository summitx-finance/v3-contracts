import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  PoolCreationHandler: require('../artifacts/contracts/PoolCreationHandler.sol/PoolCreationHandler.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('Deploying PoolCreationHandler on', networkName)
  console.log('Deployer:', owner.address)
  
  // Get pool helper addresses from environment or use zero addresses
  const poolHelper = process.env.POOL_HELPER_V3 || ethers.constants.AddressZero
  const poolHelperUniV2 = process.env.POOL_HELPER_V2 || ethers.constants.AddressZero
  
  console.log('Pool Helper V3:', poolHelper)
  console.log('Pool Helper V2:', poolHelperUniV2)
  
  // Deploy PoolCreationHandler
  const PoolCreationHandler = new ContractFactory(
    artifacts.PoolCreationHandler.abi,
    artifacts.PoolCreationHandler.bytecode,
    owner
  )
  
  const poolCreationHandler = await PoolCreationHandler.deploy(poolHelper, poolHelperUniV2)
  await poolCreationHandler.deployed()
  
  console.log('PoolCreationHandler deployed to:', poolCreationHandler.address)
  
  // Save deployment info
  const deployment = {
    PoolCreationHandler: poolCreationHandler.address,
    poolHelper: poolHelper,
    poolHelperUniV2: poolHelperUniV2,
    deployedAt: new Date().toISOString(),
    network: networkName,
    deployer: owner.address,
  }
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments')
  }
  
  fs.writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(deployment, null, 2)
  )
  
  console.log('Deployment info saved to deployments/', networkName, '.json')
  
  // Instructions for setting on factories
  console.log('\n=== Next Steps ===')
  console.log('Set this handler on your factories:')
  console.log('V2 Factory: await v2Factory.setPoolCreationHandler("' + poolCreationHandler.address + '")')
  console.log('V3 Factory: await v3Factory.setPoolCreationHandler("' + poolCreationHandler.address + '")')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })