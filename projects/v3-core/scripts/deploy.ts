import { tryVerify } from '@pancakeswap/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  FusionXV3PoolDeployer: require('../artifacts/contracts/FusionXV3PoolDeployer.sol/FusionXV3PoolDeployer.json'),
  // eslint-disable-next-line global-require
  FusionXV3Factory: require('../artifacts/contracts/FusionXV3Factory.sol/FusionXV3Factory.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)

  let pancakeV3PoolDeployer_address = ''
  let pancakeV3PoolDeployer
  const FusionXV3PoolDeployer = new ContractFactory(
    artifacts.FusionXV3PoolDeployer.abi,
    artifacts.FusionXV3PoolDeployer.bytecode,
    owner
  )
  if (!pancakeV3PoolDeployer_address) {
    pancakeV3PoolDeployer = await FusionXV3PoolDeployer.deploy()

    pancakeV3PoolDeployer_address = pancakeV3PoolDeployer.address
    console.log('pancakeV3PoolDeployer', pancakeV3PoolDeployer_address)
  } else {
    pancakeV3PoolDeployer = new ethers.Contract(
      pancakeV3PoolDeployer_address,
      artifacts.FusionXV3PoolDeployer.abi,
      owner
    )
  }

  let pancakeV3Factory_address = ''
  let pancakeV3Factory
  if (!pancakeV3Factory_address) {
    const FusionXV3Factory = new ContractFactory(
      artifacts.FusionXV3Factory.abi,
      artifacts.FusionXV3Factory.bytecode,
      owner
    )
    pancakeV3Factory = await FusionXV3Factory.deploy(pancakeV3PoolDeployer_address)

    pancakeV3Factory_address = pancakeV3Factory.address
    console.log('pancakeV3Factory', pancakeV3Factory_address)
  } else {
    pancakeV3Factory = new ethers.Contract(pancakeV3Factory_address, artifacts.FusionXV3Factory.abi, owner)
  }

  // Set FactoryAddress for pancakeV3PoolDeployer.
  await pancakeV3PoolDeployer.setFactoryAddress(pancakeV3Factory_address);


  const contracts = {
    FusionXV3Factory: pancakeV3Factory_address,
    FusionXV3PoolDeployer: pancakeV3PoolDeployer_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
