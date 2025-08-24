import { ethers } from 'hardhat'
import MuchFiV3PoolArtifact from '../artifacts/contracts/MuchFiV3Pool.sol/MuchFiV3Pool.json'

const hash = ethers.utils.keccak256(MuchFiV3PoolArtifact.bytecode)
console.log(hash)
