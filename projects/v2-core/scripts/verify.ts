import { verifyContract } from '@summitx/common/verify'
import { sleep } from '@summitx/common/sleep'
import { network } from 'hardhat'
import { configs } from '@summitx/common/config'
async function main() {
  const networkName = network.name
  const config = configs[networkName]
  const deployedContracts = await import(`@summitx/v2-core/deployments/${networkName}.json`)
  // Verify WNative
  console.log('Verify WNative')
  await verifyContract(deployedContracts.WNative,[])
  await sleep(10000)

  // Verify SummitXFactory
  console.log('Verify SummitXFactory')
  await verifyContract(deployedContracts.SummitXV2Factory,[config.admin])
  await sleep(10000)

  // Verify SummitXRouter
  console.log('Verify SummitXRouter')
  await verifyContract(deployedContracts.SummitXRouter, [deployedContracts.SummitXV2Factory, deployedContracts.WNative])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
