import { verifyContract } from '@summitx/common/verify'
import { sleep } from '@summitx/common/sleep'
import { network } from 'hardhat'
import { configs } from '@summitx/common/config'
async function main() {
  const networkName = network.name
  const config = configs[networkName]
  const deployedContracts = await import(`@summitx/v2-core/deployments/${networkName}.json`)

  // Verify DAI
  console.log('Verify DAI')
  await verifyContract(deployedContracts.DAI)
  await sleep(10000)

  // Verify USDT
  console.log('Verify USDT')
  await verifyContract(deployedContracts.USDT)
  await sleep(10000)

  // Verify USDC
  console.log('Verify USDC')
  await verifyContract(deployedContracts.USDC)
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
