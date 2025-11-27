import { ethers, network } from 'hardhat'
import { configs } from '@summitx/common/config'
import { tryVerify } from '@summitx/common/verify'
import { writeFileSync } from 'fs'

async function main() {
  // Remember to update the init code hash in SC for different chains before deploying
  const networkName = network.name
  const config = configs[networkName as keyof typeof configs]
  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }

  const v3DeployedContracts = await import(`@summitx/v3-core/deployments/${networkName}.json`)
  const v3PeripheryDeployedContracts = await import(`@summitx/v3-periphery/deployments/${networkName}.json`)
  const v2DeployedContracts = await import(`@summitx/v2-core/deployments/${networkName}.json`)
  const summitxV3PoolDeployer_address = v3DeployedContracts.SummitXV3PoolDeployer
  const summitxV3Factory_address = v3DeployedContracts.SummitXV3Factory
  const positionManager_address = v3PeripheryDeployedContracts.NonfungiblePositionManager

  /** SmartRouterHelper */
  console.log('Deploying SmartRouterHelper...')
  const SmartRouterHelper = await ethers.getContractFactory('SmartRouterHelper')
  const smartRouterHelper = await SmartRouterHelper.deploy({ gasLimit: 999999999 })
  console.log('SmartRouterHelper deployed to:', smartRouterHelper.address)
  await tryVerify(smartRouterHelper)

  /** SmartRouter */
  console.log('Deploying SmartRouter...')
  const SmartRouter = await ethers.getContractFactory('SmartRouter', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const smartRouter = await SmartRouter.deploy(
    v2DeployedContracts.SummitXV2Factory,
    summitxV3PoolDeployer_address,
    summitxV3Factory_address,
    positionManager_address,
    config.stableFactory,
    config.stableInfo,
    v2DeployedContracts.WNative,
    { gasLimit: 999999999 }
  )
  console.log('SmartRouter deployed to:', smartRouter.address)

  await tryVerify(smartRouter, [
    v2DeployedContracts.SummitXV2Factory,
    summitxV3PoolDeployer_address,
    summitxV3Factory_address,
    positionManager_address,
    config.stableFactory,
    config.stableInfo,
    v2DeployedContracts.WNative,
  ])

  /** MixedRouteQuoterV1 */
  const MixedRouteQuoterV1 = await ethers.getContractFactory('MixedRouteQuoterV1', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const mixedRouteQuoterV1 = await MixedRouteQuoterV1.deploy(
    summitxV3PoolDeployer_address,
    summitxV3Factory_address,
    v2DeployedContracts.SummitXV2Factory,
    config.stableFactory,
    v2DeployedContracts.WNative,
    { gasLimit: 999999999 }
  )
  console.log('MixedRouteQuoterV1 deployed to:', mixedRouteQuoterV1.address)

  await tryVerify(mixedRouteQuoterV1, [
    summitxV3PoolDeployer_address,
    summitxV3Factory_address,
    v2DeployedContracts.SummitXV2Factory,
    config.stableFactory,
    v2DeployedContracts.WNative,
  ])

  // /** QuoterV2 */
  // const QuoterV2 = await ethers.getContractFactory('QuoterV2', {
  //   libraries: {
  //     SmartRouterHelper: smartRouterHelper.address,
  //   },
  // })
  // const quoterV2 = await QuoterV2.deploy(summitxV3PoolDeployer_address, summitxV3Factory_address, v2DeployedContracts.WNative)
  // console.log('QuoterV2 deployed to:', quoterV2.address)

  // // await tryVerify(quoterV2, [summitxV3PoolDeployer_address, summitxV3Factory_address, v2DeployedContracts.WNative])

  /** TokenValidator */
  const TokenValidator = await ethers.getContractFactory('TokenValidator', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    },
  })
  const tokenValidator = await TokenValidator.deploy(v2DeployedContracts.SummitXV2Factory, positionManager_address, { gasLimit: 999999999 })
  console.log('TokenValidator deployed to:', tokenValidator.address)

  await tryVerify(tokenValidator, [v2DeployedContracts.SummitXV2Factory, positionManager_address])

  const contracts = {
    SmartRouter: smartRouter.address,
    SmartRouterHelper: smartRouterHelper.address,
    MixedRouteQuoterV1: mixedRouteQuoterV1.address,
    //QuoterV2: quoterV2.address,
    TokenValidator: tokenValidator.address,
  }

  writeFileSync(`./deployments/${network.name}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
