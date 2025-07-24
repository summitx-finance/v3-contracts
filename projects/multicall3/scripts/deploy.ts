import { tryVerify } from '@summitx/common/verify'
import { ContractFactory } from 'ethers'
import { configs } from '@summitx/common/config'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // eslint-disable-next-line global-require
  Multicall3: require('../artifacts/contracts/Multicall3.sol/Multicall3.json')
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
  
  let multicall3_address = ''
  let multicall3
  const Multicall3 = new ContractFactory(
    artifacts.Multicall3.abi,
    artifacts.Multicall3.bytecode,
    owner
  )
  if (!multicall3_address) {
    multicall3 = await Multicall3.deploy()
    multicall3_address = multicall3.address
    console.log('multicall3', multicall3_address)
  } else {
    multicall3 = new ethers.Contract(multicall3_address, artifacts.Multicall3.abi, owner)
  }

  const contracts = {
    Multicall3: multicall3_address,
  }

  fs.writeFileSync(`./deployments/${networkName}.json`, JSON.stringify(contracts, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
