import { ethers, network } from 'hardhat'
import { configs } from '@summitx/common/config'
import { tryVerify } from '@summitx/common/verify'
import fs from 'fs'
import { abi } from '@summitx/v3-core/artifacts/contracts/SummitXV3Factory.sol/SummitXV3Factory.json'

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

  const v3DeployedContracts = await import(`@summitx/v3-core/deployments/${networkName}.json`)
  const mcV3DeployedContracts = await import(`@summitx/lbp-masterchef-v3/deployments/${networkName}.json`)

  const summitxV3Factory_address = v3DeployedContracts.SummitXV3Factory

  const SummitXV3LmPoolDeployer = await ethers.getContractFactory('LBPSummitXV3LmPoolDeployer')
  const summitxV3LmPoolDeployer = await SummitXV3LmPoolDeployer.deploy(mcV3DeployedContracts.LBPMasterChefV3)

  console.log('summitxV3LmPoolDeployer deployed to:', summitxV3LmPoolDeployer.address)

  const summitxV3Factory = new ethers.Contract(summitxV3Factory_address, abi, owner)

  await summitxV3Factory.setLmPoolDeployer(summitxV3LmPoolDeployer.address)

  
  const contracts = {
    LBPSummitXV3LmPoolDeployer: summitxV3LmPoolDeployer.address,
  }
  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
