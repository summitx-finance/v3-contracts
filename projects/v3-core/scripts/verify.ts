import { verifyContract } from '@muchfi/common/verify'
import { sleep } from '@muchfi/common/sleep'
import { network } from 'hardhat'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@muchfi/v3-core/deployments/${networkName}.json`)

  // Verify MuchFiV3PoolDeployer
  console.log('Verify MuchFiV3PoolDeployer')
  await verifyContract(deployedContracts.MuchFiV3PoolDeployer)
  await sleep(10000)

  // Verify muchfiV3Factory
  console.log('Verify muchfiV3Factory')
  await verifyContract(deployedContracts.MuchFiV3Factory, [deployedContracts.MuchFiV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
