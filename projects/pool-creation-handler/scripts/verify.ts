import { verifyContract } from '@summitx/common/verify'
import { sleep } from '@summitx/common/sleep'
import { configs } from '@summitx/common/config'

async function main() {
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  
 
  // Get pool helper addresses from environment or use zero addresses
  const poolHelper = config.poolHelperV3 || ethers.constants.AddressZero
  const poolHelperUniV2 = config.poolHelperV2 || ethers.constants.AddressZero
  // Verify PoolCreationHandler
  console.log('Verify PoolCreationHandler')
  await verifyContract("0x18307F2B4AD06C6BBdeCe7AB173BBBe940a0d202", [
    poolHelper,
    poolHelperUniV2
  ])
  await sleep(10000)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
