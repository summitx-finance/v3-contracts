import { verifyContract } from '@muchfi/common/verify'
import { sleep } from '@muchfi/common/sleep'
import { network } from 'hardhat'
import { configs } from '@muchfi/common/config'
async function main() {
  const networkName = network.name
  const config = configs[networkName]
  const deployedContracts = await import(`@muchfi/v2-core/deployments/${networkName}.json`)
  // Verify WNative
  console.log('Verify WNative')
  await verifyContract(deployedContracts.WNative,[])
  await sleep(10000)

  // Verify MuchFiFactory
  console.log('Verify MuchFiFactory')
  await verifyContract(deployedContracts.MuchFiV2Factory,[config.admin])
  await sleep(10000)

  // Verify MuchFiRouter
  console.log('Verify MuchFiRouter')
  await verifyContract(deployedContracts.MuchFiRouter, [deployedContracts.MuchFiV2Factory, deployedContracts.WNative])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
