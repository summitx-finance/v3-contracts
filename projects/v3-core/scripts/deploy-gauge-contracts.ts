import { ContractFactory } from 'ethers'
import { ethers, network } from 'hardhat'
import fs from 'fs'

type ContractJson = { abi: any; bytecode: string }
const artifacts: { [name: string]: ContractJson } = {
  Gauge: require('../artifacts/contracts/Gauge.sol/Gauge.json'),
  FeeDistributor: require('../artifacts/contracts/FeeDistributor.sol/FeeDistributor.json'),
}

interface DeploymentConfig {
  SummitXV3Factory: string
  ProtocolFeeCollector: string
  Voter: string
}

async function main() {
  const [owner] = await ethers.getSigners()
  const networkName = network.name
  console.log('👤 Deployer:', owner.address)
  
  // Load existing deployment
  const deploymentPath = `./deployments/${networkName}-shadow-integration.json`
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Shadow integration deployment not found. Please run deploy-shadow-integration.ts first.')
    process.exit(1)
  }
  
  const deployment: DeploymentConfig = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'))
  console.log('📋 Loaded deployment config from:', deploymentPath)

  // Get pool address from command line args or use default
  const poolAddress = process.argv[2] || '0x0000000000000000000000000000000000000001'
  
  if (poolAddress === '0x0000000000000000000000000000000000000001') {
    console.log('ℹ️  Using default pool address. Run with: npx hardhat run scripts/deploy-gauge-contracts.ts --pool <POOL_ADDRESS>')
  }
  
  console.log('🏊 Target pool:', poolAddress)

  // 1. Deploy Gauge for the pool
  console.log('\n=== Deploying Gauge Contract ===')
  
  const Gauge = new ContractFactory(
    artifacts.Gauge.abi,
    artifacts.Gauge.bytecode,
    owner
  )
  const gauge = await Gauge.deploy(poolAddress, deployment.Voter)
  await gauge.deployed()
  console.log('✅ Gauge deployed at:', gauge.address)

  // 2. Deploy FeeDistributor for the gauge
  console.log('\n=== Deploying FeeDistributor Contract ===')
  
  const FeeDistributor = new ContractFactory(
    artifacts.FeeDistributor.abi,
    artifacts.FeeDistributor.bytecode,
    owner
  )
  const feeDistributor = await FeeDistributor.deploy(gauge.address)
  await feeDistributor.deployed()
  console.log('✅ FeeDistributor deployed at:', feeDistributor.address)

  // 3. Configure Voter with new gauge (would need to be implemented in Voter contract)
  console.log('\n=== Configuring Voter ===')
  
  const voter = await ethers.getContractAt('Voter', deployment.Voter)
  
  // Note: This would require implementing setGaugeForPool in Voter contract
  try {
    // Placeholder for voter configuration
    console.log('ℹ️  Voter configuration would happen here (requires implementation)')
    console.log('   - Set gauge for pool mapping')
    console.log('   - Set fee distributor for gauge mapping')
    console.log('   - Mark gauge as alive')
  } catch (error) {
    console.log('⚠️  Voter configuration skipped (not implemented)')
  }

  // 4. Test gauge functionality
  console.log('\n=== Testing Gauge Functionality ===')
  
  // Check if gauge is alive
  const isAlive = await gauge.isAlive()
  console.log('🟢 Gauge is alive:', isAlive)
  
  // Check pool address
  const gaugePool = await gauge.pool()
  console.log('🏊 Gauge pool:', gaugePool)
  
  // Check voter address
  const gaugeVoter = await gauge.voter()
  console.log('🗳️  Gauge voter:', gaugeVoter)

  // 5. Save gauge deployment info
  const gaugeDeployment = {
    Pool: poolAddress,
    Gauge: gauge.address,
    FeeDistributor: feeDistributor.address,
    Network: networkName,
    DeployedAt: new Date().toISOString(),
    Deployer: owner.address,
  }

  // Update main deployment file with gauge info
  const updatedDeployment = {
    ...deployment,
    Gauges: {
      ...deployment.Gauges || {},
      [poolAddress]: gaugeDeployment
    }
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(updatedDeployment, null, 2))
  
  // Also save individual gauge deployment
  fs.writeFileSync(
    `./deployments/${networkName}-gauge-${poolAddress.slice(0, 8)}.json`,
    JSON.stringify(gaugeDeployment, null, 2)
  )

  console.log('\n=== Deployment Summary ===')
  console.log('🎉 Gauge contracts deployed successfully!')
  console.log('📁 Updated deployment file:', deploymentPath)
  console.log('\n📋 New Contracts:')
  console.log('   Pool:', poolAddress)
  console.log('   Gauge:', gauge.address)
  console.log('   FeeDistributor:', feeDistributor.address)
  
  console.log('\n⚡ Next Steps:')
  console.log('1. Configure voter to recognize new gauge')
  console.log('2. Set up reward tokens for the gauge')
  console.log('3. Test staking and reward distribution')
  console.log('4. Enable voting for gauge weights')

  console.log('\n💡 Usage Examples:')
  console.log('   // Stake in gauge (requires LP tokens)')
  console.log('   await gauge.deposit(amount)')
  console.log('   ')
  console.log('   // Add rewards to gauge')
  console.log('   await gauge.notifyRewardAmount(rewardToken, amount)')
  console.log('   ')
  console.log('   // Claim rewards')
  console.log('   await gauge.claimAllRewards()')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Gauge deployment failed:', error)
    process.exit(1)
  })