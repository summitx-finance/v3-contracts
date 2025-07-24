import { ethers } from 'hardhat'
import SummitXV3PoolArtifact from '../artifacts/contracts/SummitXV3Pool.sol/SummitXV3Pool.json'

const hash = ethers.utils.keccak256(SummitXV3PoolArtifact.bytecode)
console.log(hash)
