import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeMuchFiV3Pool } from '../../typechain-types/contracts/test/MockTimeMuchFiV3Pool'
import { TestERC20 } from '../../typechain-types/contracts/test/TestERC20'
import { MuchFiV3Factory } from '../../typechain-types/contracts/MuchFiV3Factory'
import { MuchFiV3PoolDeployer } from '../../typechain-types/contracts/MuchFiV3PoolDeployer'
import { TestMuchFiV3Callee } from '../../typechain-types/contracts/test/TestMuchFiV3Callee'
import { TestMuchFiV3Router } from '../../typechain-types/contracts/test/TestMuchFiV3Router'
import { MockTimeMuchFiV3PoolDeployer } from '../../typechain-types/contracts/test/MockTimeMuchFiV3PoolDeployer'
import MuchFiV3LmPoolArtifact from '@muchfi/v3-lm-pool/artifacts/contracts/MuchFiV3LmPool.sol/MuchFiV3LmPool.json'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: MuchFiV3Factory
}

interface DeployerFixture {
  deployer: MuchFiV3PoolDeployer
}

async function factoryFixture(): Promise<FactoryFixture> {
  const { deployer } = await deployerFixture()
  const factoryFactory = await ethers.getContractFactory('MuchFiV3Factory')
  const factory = (await factoryFactory.deploy(deployer.address)) as MuchFiV3Factory
  return { factory }
}
async function deployerFixture(): Promise<DeployerFixture> {
  const deployerFactory = await ethers.getContractFactory('MuchFiV3PoolDeployer')
  const deployer = (await deployerFactory.deploy()) as MuchFiV3PoolDeployer
  return { deployer }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestMuchFiV3Callee
  swapTargetRouter: TestMuchFiV3Router
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeMuchFiV3Pool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeMuchFiV3PoolDeployerFactory = await ethers.getContractFactory('MockTimeMuchFiV3PoolDeployer')
  const MockTimeMuchFiV3PoolFactory = await ethers.getContractFactory('MockTimeMuchFiV3Pool')

  const calleeContractFactory = await ethers.getContractFactory('TestMuchFiV3Callee')
  const routerContractFactory = await ethers.getContractFactory('TestMuchFiV3Router')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestMuchFiV3Callee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestMuchFiV3Router

  const MuchFiV3LmPoolFactory = await ethers.getContractFactoryFromArtifact(MuchFiV3LmPoolArtifact)

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer =
        (await MockTimeMuchFiV3PoolDeployerFactory.deploy()) as MockTimeMuchFiV3PoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string

      const mockTimeMuchFiV3Pool = MockTimeMuchFiV3PoolFactory.attach(poolAddress) as MockTimeMuchFiV3Pool

      await (
        await factory.setLmPool(
          poolAddress,
          (
            await MuchFiV3LmPoolFactory.deploy(
              poolAddress,
              ethers.constants.AddressZero,
              Math.floor(Date.now() / 1000)
            )
          ).address
        )
      ).wait()

      return mockTimeMuchFiV3Pool
    },
  }
}
