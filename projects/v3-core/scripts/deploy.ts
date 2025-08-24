import { tryVerify } from '@muchfi/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  MuchFiV3PoolDeployer: require('../artifacts/contracts/MuchFiV3PoolDeployer.sol/MuchFiV3PoolDeployer.json'),
  // eslint-disable-next-line global-require
  MuchFiV3Factory: require('../artifacts/contracts/MuchFiV3Factory.sol/MuchFiV3Factory.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)
  
  const ownerBalance = await owner.getBalance()
  console.log('ownerBalance', ownerBalance.toString())

  let muchfiV3PoolDeployer_address = ''
  let muchfiV3PoolDeployer
  const MuchFiV3PoolDeployer = new ContractFactory(
    artifacts.MuchFiV3PoolDeployer.abi,
    artifacts.MuchFiV3PoolDeployer.bytecode,
    owner
  )
  if (!muchfiV3PoolDeployer_address) {
    muchfiV3PoolDeployer = await MuchFiV3PoolDeployer.deploy()

    muchfiV3PoolDeployer_address = muchfiV3PoolDeployer.address
    console.log('muchfiV3PoolDeployer', muchfiV3PoolDeployer_address)
  } else {
    muchfiV3PoolDeployer = new ethers.Contract(
      muchfiV3PoolDeployer_address,
      artifacts.MuchFiV3PoolDeployer.abi,
      owner
    )
  }
  await sleep(10000)
  const v3PoolInitCodeHash = await muchfiV3PoolDeployer.INIT_CODE_PAIR_HASH()
  console.log('muchfiV3PoolDeployer POOL_INIT_CODE_HASH',v3PoolInitCodeHash)

  let muchfiV3Factory_address = ''
  let muchfiV3Factory
  if (!muchfiV3Factory_address) {
    const MuchFiV3Factory = new ContractFactory(
      artifacts.MuchFiV3Factory.abi,
      artifacts.MuchFiV3Factory.bytecode,
      owner
    )
    muchfiV3Factory = await MuchFiV3Factory.deploy(muchfiV3PoolDeployer_address)

    muchfiV3Factory_address = muchfiV3Factory.address
    console.log('muchfiV3Factory', muchfiV3Factory_address)
  } else {
    muchfiV3Factory = new ethers.Contract(muchfiV3Factory_address, artifacts.MuchFiV3Factory.abi, owner)
  }

  // Set FactoryAddress for muchfiV3PoolDeployer.
  await muchfiV3PoolDeployer.setFactoryAddress(muchfiV3Factory_address);


  const contracts = {
    MuchFiV3Factory: muchfiV3Factory_address,
    MuchFiV3PoolDeployer: muchfiV3PoolDeployer_address,
    V3_POOL_INIT_CODE_HASH: v3PoolInitCodeHash,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

