import { tryVerify } from '@muchfi/common/verify'
import { ContractFactory } from 'ethers'
import { configs } from '@muchfi/common/config'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  MuchFiV2Factory: require('../artifacts/contracts/MuchFiFactory.sol/MuchFiFactory.json'),
  // eslint-disable-next-line global-require
  MuchFiRouter: require('../artifacts/contracts/MuchFiRouter.sol/MuchFiRouter.json'),
  // eslint-disable-next-line global-require
  WNATIVE: require('../artifacts/contracts/WNATIVE.sol/WDOGE.json'),
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
  let muchfiFactory_address = ''
  let muchfiFactory
  const MuchFiFactory = new ContractFactory(
    artifacts.MuchFiV2Factory.abi,
    artifacts.MuchFiV2Factory.bytecode,
    owner
  )
  if (!muchfiFactory_address) {
    if(!config.admin){
      throw new Error(`No admin found for network ${networkName}`)
    }
    if(config.admin === '0x0000000000000000000000000000000000000000'){
      throw new Error(`Admin is not set for network ${networkName}`)
    }
    muchfiFactory = await MuchFiFactory.deploy(config.admin)

    muchfiFactory_address = muchfiFactory.address
    console.log('muchfiFactory', muchfiFactory_address)
  } else {
    muchfiFactory = new ethers.Contract(
      muchfiFactory_address,
      artifacts.MuchFiV2Factory.abi,
      owner
    )
  }
    const initCodePairHash = await muchfiFactory.INIT_CODE_PAIR_HASH();
    console.log('initCodePairHash', initCodePairHash);

  let muchfiRouter_address = ''
  let muchfiRouter
  if (!muchfiRouter_address) {
    const MuchFiRouter = new ContractFactory(
      artifacts.MuchFiRouter.abi,
      artifacts.MuchFiRouter.bytecode,
      owner
    )
    muchfiRouter = await MuchFiRouter.deploy(muchfiFactory_address, wNative_address)

    muchfiRouter_address = muchfiRouter.address
    console.log('muchfiRouter', muchfiRouter_address)
  } else {
    muchfiRouter = new ethers.Contract(muchfiRouter_address, artifacts.MuchFiRouter.abi, owner)
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
    MuchFiV2Factory: muchfiFactory_address,
    V2_PAIR_INIT_CODE_HASH: initCodePairHash,
    MuchFiRouter: muchfiRouter_address,
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
