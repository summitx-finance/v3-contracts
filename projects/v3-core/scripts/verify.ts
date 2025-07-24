import { verifyContract } from '@pancakeswap/common/verify'
import { sleep } from '@pancakeswap/common/sleep'

async function main() {
  const networkName = network.name
  const deployedContracts = await import(`@pancakeswap/v3-core/deployments/${networkName}.json`)

  // Verify FusionXV3PoolDeployer
  console.log('Verify FusionXV3PoolDeployer')
  await verifyContract(deployedContracts.FusionXV3PoolDeployer)
  await sleep(10000)

  // Verify pancakeV3Factory
  console.log('Verify pancakeV3Factory')
  await verifyContract(deployedContracts.FusionXV3Factory, [deployedContracts.FusionXV3PoolDeployer])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
