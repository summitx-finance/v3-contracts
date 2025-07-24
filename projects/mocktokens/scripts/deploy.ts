import { tryVerify } from '@summitx/common/verify'
import { ContractFactory } from 'ethers'
import { configs } from '@summitx/common/config'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  DAI: require('../artifacts/contracts/DAI.sol/DAI.json'),
  // eslint-disable-next-line global-require
  USDT: require('../artifacts/contracts/USDT.sol/USDT.json'),
  // eslint-disable-next-line global-require
  USDC: require('../artifacts/contracts/USDC.sol/USDC.json'),
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
  

  let dai_address = ""
  let dai
  const DAI = new ContractFactory(
    artifacts.DAI.abi,
    artifacts.DAI.bytecode,
    owner
  )
  if (!dai_address) {
    dai = await DAI.deploy()
    dai_address = dai.address
    console.log('dai', dai_address)
  } else {
    dai = new ethers.Contract(dai_address, artifacts.DAI.abi, owner)
    console.log('dai existing ', dai_address)
  }

  let usdt_address = ""
  let usdt
  const USDT = new ContractFactory(
    artifacts.USDT.abi,
    artifacts.USDT.bytecode,
    owner
  )
  if (!usdt_address) {
    usdt = await USDT.deploy()
    usdt_address = usdt.address
    console.log('usdt', usdt_address)
  } else {
    usdt = new ethers.Contract(usdt_address, artifacts.USDT.abi, owner)
  }

  let usdc_address
  let usdc
  const USDC = new ContractFactory(
    artifacts.USDC.abi,
    artifacts.USDC.bytecode,
    owner
  )
  if (!usdc_address) {
    usdc = await USDC.deploy()
    usdc_address = usdc.address
    console.log('usdc', usdc_address)
  } else {
    usdc = new ethers.Contract(usdc_address, artifacts.USDC.abi, owner)
  }

  const contracts = {
    DAI: dai_address,
    USDT: usdt_address,
    USDC: usdc_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
