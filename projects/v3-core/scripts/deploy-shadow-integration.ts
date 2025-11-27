import { tryVerify } from '@summitx/common/verify'
import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  // Core contracts
  SummitXV3PoolDeployer: require('../artifacts/contracts/SummitXV3PoolDeployer.sol/SummitXV3PoolDeployer.json'),
  SummitXV3Factory: require('../artifacts/contracts/SummitXV3Factory.sol/SummitXV3Factory.json'),
  
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

  // 1. Deploy SummitXV3PoolDeployer
  console.log('\n=== Deploying Core Contracts ===')
  
  const SummitXV3PoolDeployer = new ContractFactory(
    artifacts.SummitXV3PoolDeployer.abi,
    artifacts.SummitXV3PoolDeployer.bytecode,
    owner
  )
  const summitxV3PoolDeployer = await SummitXV3PoolDeployer.deploy({ gasLimit: 999999999 })
  await summitxV3PoolDeployer.deployed()
  console.log('✅ SummitXV3PoolDeployer deployed at:', summitxV3PoolDeployer.address)
  
  const v3PoolInitCodeHash = await summitxV3PoolDeployer.INIT_CODE_PAIR_HASH()
  console.log('📋 V3_POOL_INIT_CODE_HASH:', v3PoolInitCodeHash)

  // 2. Deploy SummitXV3Factory
  const SummitXV3Factory = new ContractFactory(
    artifacts.SummitXV3Factory.abi,
    artifacts.SummitXV3Factory.bytecode,
    owner
  )
  const summitxV3Factory = await SummitXV3Factory.deploy(summitxV3PoolDeployer.address, { gasLimit: 999999999 })
  await summitxV3Factory.deployed()
  console.log('✅ SummitXV3Factory deployed at:', summitxV3Factory.address)

  // Set FactoryAddress for summitxV3PoolDeployer
  await summitxV3PoolDeployer.setFactoryAddress(summitxV3Factory.address, { gasLimit: 999999999 })
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
    summitxV3Factory.address,  // factory
    ethers.constants.AddressZero,  // gaugeFactory (placeholder)
    ethers.constants.AddressZero,   // feeDistributorFactory (placeholder)
    { gasLimit: 999999999 }
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
    voter.address,   // voter
    { gasLimit: 999999999 }
  )
  await protocolFeeCollector.deployed()
  console.log('✅ ProtocolFeeCollector deployed at:', protocolFeeCollector.address)

  // 4. Configure Factory with Protocol Fee Collector
  await summitxV3Factory.setProtocolFeeCollector(protocolFeeCollector.address, { gasLimit: 999999999 })
  console.log('✅ Protocol Fee Collector set in Factory')

  // 5. Create test pool (optional)
  console.log('\n=== Creating Test Pool ===')
  
  // Create a test pool with WETH/USDC (using mock addresses for demonstration)
  const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'  // Mainnet WETH
  const USDC = '0xA0b86a33E6441b46E09E8FCF2af07C5E0E4B8D7B'  // Mock USDC
  const fee = 500  // 0.05%
  
  try {
    const poolTx = await summitxV3Factory.createPool(WETH, USDC, fee, { gasLimit: 999999999 })
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
  await protocolFeeCollector.setTreasuryFees(1000, { gasLimit: 999999999 })
  console.log('✅ Treasury fees set to 10%')

  // 7. Save deployment info
  const contracts = {
    // Core contracts
    SummitXV3Factory: summitxV3Factory.address,
    SummitXV3PoolDeployer: summitxV3PoolDeployer.address,
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
  console.log('   Factory:', summitxV3Factory.address)
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
      await tryVerify(summitxV3PoolDeployer.address, [])
      await tryVerify(summitxV3Factory.address, [summitxV3PoolDeployer.address])
      await tryVerify(protocolFeeCollector.address, [owner.address, voter.address])
      await tryVerify(voter.address, [summitxV3Factory.address, ethers.constants.AddressZero, ethers.constants.AddressZero])
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