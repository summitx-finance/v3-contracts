import { tryVerify } from '@summitx/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  SummitXV3PoolDeployer: require('../artifacts/contracts/SummitXV3PoolDeployer.sol/SummitXV3PoolDeployer.json'),
  // eslint-disable-next-line global-require
  SummitXV3Factory: require('../artifacts/contracts/SummitXV3Factory.sol/SummitXV3Factory.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)
  
  const ownerBalance = await owner.getBalance()
  console.log('ownerBalance', ownerBalance.toString())

  let summitxV3PoolDeployer_address = ''
  let summitxV3PoolDeployer
  const SummitXV3PoolDeployer = new ContractFactory(
    artifacts.SummitXV3PoolDeployer.abi,
    artifacts.SummitXV3PoolDeployer.bytecode,
    owner
  )
  if (!summitxV3PoolDeployer_address) {
    summitxV3PoolDeployer = await SummitXV3PoolDeployer.deploy({ gasLimit: 999999999 })

    summitxV3PoolDeployer_address = summitxV3PoolDeployer.address
    console.log('summitxV3PoolDeployer', summitxV3PoolDeployer_address)
  } else {
    summitxV3PoolDeployer = new ethers.Contract(
      summitxV3PoolDeployer_address,
      artifacts.SummitXV3PoolDeployer.abi,
      owner
    )
  }
  await sleep(10000)
  const v3PoolInitCodeHash = await summitxV3PoolDeployer.INIT_CODE_PAIR_HASH()
  console.log('summitxV3PoolDeployer POOL_INIT_CODE_HASH',v3PoolInitCodeHash)

  let summitxV3Factory_address = ''
  let summitxV3Factory
  if (!summitxV3Factory_address) {
    const SummitXV3Factory = new ContractFactory(
      artifacts.SummitXV3Factory.abi,
      artifacts.SummitXV3Factory.bytecode,
      owner
    )
    summitxV3Factory = await SummitXV3Factory.deploy(summitxV3PoolDeployer_address, { gasLimit: 999999999 })

    summitxV3Factory_address = summitxV3Factory.address
    console.log('summitxV3Factory', summitxV3Factory_address)
  } else {
    summitxV3Factory = new ethers.Contract(summitxV3Factory_address, artifacts.SummitXV3Factory.abi, owner)
  }

  // Set FactoryAddress for summitxV3PoolDeployer.
  await summitxV3PoolDeployer.setFactoryAddress(summitxV3Factory_address, { gasLimit: 999999999 });


  const contracts = {
    SummitXV3Factory: summitxV3Factory_address,
    SummitXV3PoolDeployer: summitxV3PoolDeployer_address,
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

