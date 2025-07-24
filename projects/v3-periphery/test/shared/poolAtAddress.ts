import { abi as POOL_ABI } from '@summitx/v3-core/artifacts/contracts/SummitXV3Pool.sol/SummitXV3Pool.json'
import { Contract, Wallet } from 'ethers'
import { ISummitXV3Pool } from '../../typechain-types'

export default function poolAtAddress(address: string, wallet: Wallet): ISummitXV3Pool {
  return new Contract(address, POOL_ABI, wallet) as ISummitXV3Pool
}
