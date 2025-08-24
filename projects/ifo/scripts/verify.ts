import { verifyContract } from '@muchfi/common/verify'
import { sleep } from '@muchfi/common/sleep'
import { configs } from '@muchfi/common/config'

async function main() {
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContracts_ifo_deployer = await import(`@muchfi/ifo/deployments/${networkName}.json`)
  // const deployedContracts_v3_lm_pool = await import(`@muchfi/lbp-v3-lm-pool/deployments/${networkName}.json`)

  // Verify muchfiV3LmPoolDeployer
  console.log('Verify IFO DeployerV3')
  await verifyContract(deployedContracts_ifo_deployer.IFODeployerV3, [
  ])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
