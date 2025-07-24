import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimeSummitXV3Pool } from '../../typechain-types/contracts/test/MockTimeSummitXV3Pool'
import { TestERC20 } from '../../typechain-types/contracts/test/TestERC20'
import { SummitXV3Factory } from '../../typechain-types/contracts/SummitXV3Factory'
import { SummitXV3PoolDeployer } from '../../typechain-types/contracts/SummitXV3PoolDeployer'
import { TestSummitXV3Callee } from '../../typechain-types/contracts/test/TestSummitXV3Callee'
import { TestSummitXV3Router } from '../../typechain-types/contracts/test/TestSummitXV3Router'
import { MockTimeSummitXV3PoolDeployer } from '../../typechain-types/contracts/test/MockTimeSummitXV3PoolDeployer'
import SummitXV3LmPoolArtifact from '@summitx/v3-lm-pool/artifacts/contracts/SummitXV3LmPool.sol/SummitXV3LmPool.json'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: SummitXV3Factory
}

interface DeployerFixture {
  deployer: SummitXV3PoolDeployer
}

async function factoryFixture(): Promise<FactoryFixture> {
  const { deployer } = await deployerFixture()
  const factoryFactory = await ethers.getContractFactory('SummitXV3Factory')
  const factory = (await factoryFactory.deploy(deployer.address)) as SummitXV3Factory
  return { factory }
}
async function deployerFixture(): Promise<DeployerFixture> {
  const deployerFactory = await ethers.getContractFactory('SummitXV3PoolDeployer')
  const deployer = (await deployerFactory.deploy()) as SummitXV3PoolDeployer
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
  swapTargetCallee: TestSummitXV3Callee
  swapTargetRouter: TestSummitXV3Router
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimeSummitXV3Pool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimeSummitXV3PoolDeployerFactory = await ethers.getContractFactory('MockTimeSummitXV3PoolDeployer')
  const MockTimeSummitXV3PoolFactory = await ethers.getContractFactory('MockTimeSummitXV3Pool')

  const calleeContractFactory = await ethers.getContractFactory('TestSummitXV3Callee')
  const routerContractFactory = await ethers.getContractFactory('TestSummitXV3Router')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestSummitXV3Callee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestSummitXV3Router

  const SummitXV3LmPoolFactory = await ethers.getContractFactoryFromArtifact(SummitXV3LmPoolArtifact)

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer =
        (await MockTimeSummitXV3PoolDeployerFactory.deploy()) as MockTimeSummitXV3PoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string

      const mockTimeSummitXV3Pool = MockTimeSummitXV3PoolFactory.attach(poolAddress) as MockTimeSummitXV3Pool

      await (
        await factory.setLmPool(
          poolAddress,
          (
            await SummitXV3LmPoolFactory.deploy(
              poolAddress,
              ethers.constants.AddressZero,
              Math.floor(Date.now() / 1000)
            )
          ).address
        )
      ).wait()

      return mockTimeSummitXV3Pool
    },
  }
}
