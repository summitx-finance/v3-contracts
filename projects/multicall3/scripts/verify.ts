import { verifyContract } from '@summitx/common/verify'
import { sleep } from '@summitx/common/sleep'
import { network } from 'hardhat'
import { configs } from '@summitx/common/config'
async function main() {
  const networkName = network.name
  const config = configs[networkName]
  const deployedContracts = await import(`../deployments/${networkName}.json`)

  // Verify Multicall3
  console.log('Verify Multicall3')
  console.log('=================')
  console.log('Multicall3 address:', deployedContracts.Multicall3)
  await verifyContract(deployedContracts.Multicall3)
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
