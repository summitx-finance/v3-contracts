import { verifyContract } from '@summitx/common/verify'
import { sleep } from '@summitx/common/sleep'
import { configs } from '@summitx/common/config'

async function main() {
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const deployedContracts_v3_core = await import(`@summitx/v3-core/deployments/${networkName}.json`)
  const deployedContracts_v3_periphery = await import(`@summitx/v3-periphery/deployments/${networkName}.json`)
  const deployedContracts_smart_router = await import(`@summitx/smart-router/deployments/${networkName}.json`)
  const deployedContracts_v2_core = await import(`@summitx/v2-core/deployments/${networkName}.json`)
  // Verify SmartRouterHelper
  console.log('Verify SmartRouterHelper')
  await verifyContract(deployedContracts_smart_router.SmartRouterHelper)
  await sleep(10000)

  // Verify swapRouter
  console.log('Verify swapRouter')
  await verifyContract(deployedContracts_smart_router.SmartRouter, [
    deployedContracts_v2_core.SummitXV2Factory,
    deployedContracts_v3_core.SummitXV3PoolDeployer,
    deployedContracts_v3_core.SummitXV3Factory,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
    config.stableFactory,
    config.stableInfo,
    deployedContracts_v2_core.WNative,
  ])
  await sleep(10000)

  // Verify mixedRouteQuoterV1
  console.log('Verify mixedRouteQuoterV1')
  await verifyContract(deployedContracts_smart_router.MixedRouteQuoterV1, [
    deployedContracts_v3_core.SummitXV3PoolDeployer,
    deployedContracts_v3_core.SummitXV3Factory,
    deployedContracts_v2_core.SummitXV2Factory,
    config.stableFactory,
    deployedContracts_v2_core.WNative,
  ])
  await sleep(10000)

  // // Verify quoterV2
  // console.log('Verify QuoterV2')
  // await verifyContract(deployedContracts_smart_router.QuoterV2, [
  //   deployedContracts_v3_core.SummitXV3PoolDeployer,
  //   deployedContracts_v3_core.SummitXV3Factory,
  //   deployedContracts_v2_core.WNative,
  // ])
  // await sleep(10000)

  // Verify tokenValidator
  console.log('Verify tokenValidator')
  await verifyContract(deployedContracts_smart_router.TokenValidator, [
    deployedContracts_v2_core.SummitXV2Factory,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
  ])
  await sleep(10000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
