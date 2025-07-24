import { verifyContract } from '@summitx/common/verify'
import { sleep } from '@summitx/common/sleep'
import { configs } from '@summitx/common/config'

async function main() {
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContracts_masterchef_v3 = await import(`@summitx/lbp-masterchef-v3/deployments/${networkName}.json`)
  const deployedContracts_v3_lm_pool = await import(`@summitx/lbp-v3-lm-pool/deployments/${networkName}.json`)

  // Verify summitxV3LmPoolDeployer
  console.log('Verify summitxV3LmPoolDeployer')
  await verifyContract(deployedContracts_v3_lm_pool.LBPSummitXV3LmPoolDeployer, [
    deployedContracts_masterchef_v3.LBPMasterChefV3,
  ])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
