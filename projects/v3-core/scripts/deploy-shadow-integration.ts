import { tryVerify } from '@muchfi/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // Core contracts
  MuchFiV3PoolDeployer: require('../artifacts/contracts/MuchFiV3PoolDeployer.sol/MuchFiV3PoolDeployer.json'),
  MuchFiV3Factory: require('../artifacts/contracts/MuchFiV3Factory.sol/MuchFiV3Factory.json'),
  
  // Shadow Exchange integration contracts
  ProtocolFeeCollector: require('../artifacts/contracts/ProtocolFeeCollector.sol/ProtocolFeeCollector.json'),
  Voter: require('../artifacts/contracts/Voter.sol/Voter.json'),
  Gauge: require('../artifacts/contracts/Gauge.sol/Gauge.json'),
  FeeDistributor: require('../artifacts/contracts/FeeDistributor.sol/FeeDistributor.json'),
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('owner', owner.address)
  
  const ownerBalance = await owner.getBalance()
  console.log('ownerBalance', ownerBalance.toString())

  // 1. Deploy MuchFiV3PoolDeployer
  console.log('\n=== Deploying Core Contracts ===')
  
  const MuchFiV3PoolDeployer = new ContractFactory(
    artifacts.MuchFiV3PoolDeployer.abi,
    artifacts.MuchFiV3PoolDeployer.bytecode,
    owner
  )
  const muchfiV3PoolDeployer = await MuchFiV3PoolDeployer.deploy()
  await muchfiV3PoolDeployer.deployed()
  console.log('✅ MuchFiV3PoolDeployer deployed at:', muchfiV3PoolDeployer.address)
  
  const v3PoolInitCodeHash = await muchfiV3PoolDeployer.INIT_CODE_PAIR_HASH()
  console.log('📋 V3_POOL_INIT_CODE_HASH:', v3PoolInitCodeHash)

  // 2. Deploy MuchFiV3Factory
  const MuchFiV3Factory = new ContractFactory(
    artifacts.MuchFiV3Factory.abi,
    artifacts.MuchFiV3Factory.bytecode,
    owner
  )
  const muchfiV3Factory = await MuchFiV3Factory.deploy(muchfiV3PoolDeployer.address)
  await muchfiV3Factory.deployed()
  console.log('✅ MuchFiV3Factory deployed at:', muchfiV3Factory.address)

  // Set FactoryAddress for muchfiV3PoolDeployer
  await muchfiV3PoolDeployer.setFactoryAddress(muchfiV3Factory.address)
  console.log('✅ Factory address set in PoolDeployer')

  // 3. Deploy Shadow Exchange Integration Contracts
  console.log('\n=== Deploying Shadow Exchange Integration ===')

  // Deploy Voter (placeholder for gauge creation)
  const Voter = new ContractFactory(
    artifacts.Voter.abi,
    artifacts.Voter.bytecode,
    owner
  )
  const voter = await Voter.deploy(
    muchfiV3Factory.address,  // factory
    ethers.constants.AddressZero,  // gaugeFactory (placeholder)
    ethers.constants.AddressZero   // feeDistributorFactory (placeholder)
  )
  await voter.deployed()
  console.log('✅ Voter deployed at:', voter.address)

  // Deploy Protocol Fee Collector
  const ProtocolFeeCollector = new ContractFactory(
    artifacts.ProtocolFeeCollector.abi,
    artifacts.ProtocolFeeCollector.bytecode,
    owner
  )
  const protocolFeeCollector = await ProtocolFeeCollector.deploy(
    owner.address,  // treasury
    voter.address   // voter
  )
  await protocolFeeCollector.deployed()
  console.log('✅ ProtocolFeeCollector deployed at:', protocolFeeCollector.address)

  // 4. Configure Factory with Protocol Fee Collector
  await muchfiV3Factory.setProtocolFeeCollector(protocolFeeCollector.address)
  console.log('✅ Protocol Fee Collector set in Factory')

  // 5. Create test pool (optional)
  console.log('\n=== Creating Test Pool ===')
  
  // Create a test pool with WETH/USDC (using mock addresses for demonstration)
  const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'  // Mainnet WETH
  const USDC = '0xA0b86a33E6441b46E09E8FCF2af07C5E0E4B8D7B'  // Mock USDC
  const fee = 500  // 0.05%
  
  try {
    const poolTx = await muchfiV3Factory.createPool(WETH, USDC, fee)
    const poolReceipt = await poolTx.wait()
    
    // Get pool address from event
    const poolCreatedEvent = poolReceipt.events?.find(e => e.event === 'PoolCreated')
    const poolAddress = poolCreatedEvent?.args?.pool
    
    console.log('✅ Test Pool created at:', poolAddress)
  } catch (error) {
    console.log('ℹ️  Test pool creation skipped (may already exist)')
  }

  // 6. Setup Protocol Fees
  console.log('\n=== Configuring Protocol Fees ===')
  
  // Set default treasury fees to 10% (1000 basis points)
  await protocolFeeCollector.setTreasuryFees(1000)
  console.log('✅ Treasury fees set to 10%')

  // 7. Save deployment info
  const contracts = {
    // Core contracts
    MuchFiV3Factory: muchfiV3Factory.address,
    MuchFiV3PoolDeployer: muchfiV3PoolDeployer.address,
    V3_POOL_INIT_CODE_HASH: v3PoolInitCodeHash,
    
    // Shadow Exchange integration
    ProtocolFeeCollector: protocolFeeCollector.address,
    Voter: voter.address,
    
    // Configuration
    Treasury: owner.address,
    TreasuryFeePercentage: '10%',
    
    // Network info
    Network: networkName,
    DeployedAt: new Date().toISOString(),
    Deployer: owner.address,
  }

  // Ensure deployments directory exists
  if (!fs.existsSync('./deployments')) {
    fs.mkdirSync('./deployments')
  }

  fs.writeFileSync(`./deployments/${networkName}-shadow-integration.json`, JSON.stringify(contracts, null, 2))

  console.log('\n=== Deployment Summary ===')
  console.log('🎉 Shadow Exchange integration deployed successfully!')
  console.log('📁 Deployment details saved to:', `./deployments/${networkName}-shadow-integration.json`)
  console.log('\n📋 Key Addresses:')
  console.log('   Factory:', muchfiV3Factory.address)
  console.log('   ProtocolFeeCollector:', protocolFeeCollector.address)
  console.log('   Voter:', voter.address)
  console.log('   Treasury:', owner.address)
  
  console.log('\n⚡ Next Steps:')
  console.log('1. Deploy gauge and fee distributor contracts for specific pools')
  console.log('2. Configure voting tokens for gauge weight voting')
  console.log('3. Set up reward distribution schedules')
  console.log('4. Test fee collection and distribution flows')

  // 8. Verify contracts (optional)
  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    console.log('\n=== Verifying Contracts ===')
    
    try {
      await tryVerify(muchfiV3PoolDeployer.address, [])
      await tryVerify(muchfiV3Factory.address, [muchfiV3PoolDeployer.address])
      await tryVerify(protocolFeeCollector.address, [owner.address, voter.address])
      await tryVerify(voter.address, [muchfiV3Factory.address, ethers.constants.AddressZero, ethers.constants.AddressZero])
      console.log('✅ Contract verification completed')
    } catch (error) {
      console.log('⚠️  Contract verification failed:', error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  })