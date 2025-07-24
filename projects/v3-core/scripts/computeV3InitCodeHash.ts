import { ethers } from 'hardhat'
import FusionXV3PoolArtifact from '../artifacts/contracts/FusionXV3Pool.sol/FusionXV3Pool.json'

const hash = ethers.utils.keccak256(FusionXV3PoolArtifact.bytecode)
console.log(hash)
