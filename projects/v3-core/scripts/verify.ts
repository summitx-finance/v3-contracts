import { verifyContract } from '@summitx/common/verify'
import { sleep } from '@summitx/common/sleep'
import { network } from 'hardhat'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@summitx/v3-core/deployments/${networkName}.json`)

  // Verify SummitXV3PoolDeployer
  console.log('Verify SummitXV3PoolDeployer')
  await verifyContract(deployedContracts.SummitXV3PoolDeployer)
  await sleep(10000)

  // Verify summitxV3Factory
  console.log('Verify summitxV3Factory')
  await verifyContract(deployedContracts.SummitXV3Factory, [deployedContracts.SummitXV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
