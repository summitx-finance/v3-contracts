import { abi as POOL_ABI } from '@muchfi/v3-core/artifacts/contracts/MuchFiV3Pool.sol/MuchFiV3Pool.json'
import { Contract, Wallet } from 'ethers'
import { IMuchFiV3Pool } from '../../typechain-types'

export default function poolAtAddress(address: string, wallet: Wallet): IMuchFiV3Pool {
  return new Contract(address, POOL_ABI, wallet) as IMuchFiV3Pool
}
