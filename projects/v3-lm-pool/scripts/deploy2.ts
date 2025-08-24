import { ethers, network } from 'hardhat'
import { configs } from '@muchfi/common/config'
import { tryVerify } from '@muchfi/common/verify'
import fs from 'fs'
import { abi } from '@muchfi/v3-core/artifacts/contracts/MuchFiV3Factory.sol/MuchFiV3Factory.json'

import { parseEther } from 'ethers/lib/utils'
const currentNetwork = network.name

async function main() {
  const [owner] = await ethers.getSigners()
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]
  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const v3DeployedContracts = await import(`@muchfi/v3-core/deployments/${networkName}.json`)
  const mcV3DeployedContracts = await import(`@muchfi/masterchef-v3/deployments/${networkName}.json`)

  const muchfiV3Factory_address = v3DeployedContracts.MuchFiV3Factory

  const MuchFiV3LmPoolDeployer = await ethers.getContractFactory('MuchFiV3LmPoolDeployer')
  const muchfiV3LmPoolDeployer = await MuchFiV3LmPoolDeployer.deploy(mcV3DeployedContracts.MasterChefV3)

  console.log('muchfiV3LmPoolDeployer deployed to:', muchfiV3LmPoolDeployer.address)

  const muchfiV3Factory = new ethers.Contract(muchfiV3Factory_address, abi, owner)

  await muchfiV3Factory.setLmPoolDeployer(muchfiV3LmPoolDeployer.address)

  const contracts = {
    MuchFiV3LmPoolDeployer: muchfiV3LmPoolDeployer.address,
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
