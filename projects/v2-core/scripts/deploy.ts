import { tryVerify } from '@summitx/common/verify'
import { ContractFactory } from 'ethers'
import { configs } from '@summitx/common/config'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  SummitXV2Factory: require('../artifacts/contracts/SummitXFactory.sol/SummitXFactory.json'),
  // eslint-disable-next-line global-require
  SummitXRouter: require('../artifacts/contracts/SummitXRouter.sol/SummitXRouter.json'),
  // eslint-disable-next-line global-require
  WNATIVE: require('../artifacts/contracts/WNATIVE.sol/WCAMP.json'),
  // eslint-disable-next-line global-require
  Multicall2: require('../artifacts/contracts/Multicall2.sol/Multicall2.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)
  
  const config = configs[networkName as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${networkName}`)
  }
  const ownerBalance = await owner.getBalance()
  console.log('ownerBalance', ownerBalance.toString())
  let wNative_address = config.WNATIVE

  if(wNative_address === '0x0000000000000000000000000000000000000000' || !wNative_address){
    console.log('WNATIVE is not set so deploying it')
    const WNative = new ContractFactory(
      artifacts.WNATIVE.abi,
      artifacts.WNATIVE.bytecode,
      owner
    )
    const wNative = await WNative.deploy()
    wNative_address = wNative.address
    console.log('wNative', wNative_address)
  }else{
    console.log('WNATIVE is already deployed', wNative_address)
  }
  let summitxFactory_address = ''
  let summitxFactory
  const SummitXFactory = new ContractFactory(
    artifacts.SummitXV2Factory.abi,
    artifacts.SummitXV2Factory.bytecode,
    owner
  )
  if (!summitxFactory_address) {
    if(!config.admin){
      throw new Error(`No admin found for network ${networkName}`)
    }
    if(config.admin === '0x0000000000000000000000000000000000000000'){
      throw new Error(`Admin is not set for network ${networkName}`)
    }
    summitxFactory = await SummitXFactory.deploy(config.admin)

    summitxFactory_address = summitxFactory.address
    console.log('summitxFactory', summitxFactory_address)
  } else {
    summitxFactory = new ethers.Contract(
      summitxFactory_address,
      artifacts.SummitXV2Factory.abi,
      owner
    )
  }
    const initCodePairHash = await summitxFactory.INIT_CODE_PAIR_HASH();
    console.log('initCodePairHash', initCodePairHash);

  let summitxRouter_address = ''
  let summitxRouter
  if (!summitxRouter_address) {
    const SummitXRouter = new ContractFactory(
      artifacts.SummitXRouter.abi,
      artifacts.SummitXRouter.bytecode,
      owner
    )
    summitxRouter = await SummitXRouter.deploy(summitxFactory_address, wNative_address)

    summitxRouter_address = summitxRouter.address
    console.log('summitxRouter', summitxRouter_address)
  } else {
    summitxRouter = new ethers.Contract(summitxRouter_address, artifacts.SummitXRouter.abi, owner)
  }

   let multicall2_address = ''
  let multicall2
  if (!multicall2_address) {
    const Multicall2 = new ContractFactory(
      artifacts.Multicall2.abi,
      artifacts.Multicall2.bytecode,
      owner
    )
    multicall2 = await Multicall2.deploy()

    multicall2_address = multicall2.address
    console.log('multicall2', multicall2_address)
  } else {
    multicall2 = new ethers.Contract(multicall2_address, artifacts.Multicall2.abi, owner)
  }

  const contracts = {
    WNative: wNative_address,
    SummitXV2Factory: summitxFactory_address,
    V2_PAIR_INIT_CODE_HASH: initCodePairHash,
    SummitXRouter: summitxRouter_address,
    Multicall2: multicall2_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
