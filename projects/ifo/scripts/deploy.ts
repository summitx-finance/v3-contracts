import { ethers, run, network } from 'hardhat'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { configs } from '@summitx/common/config'

async function main() {
  // Get the Contract Factory
  const IFODeployerV3 = await ethers.getContractFactory('IFODeployerV3')

  const config = configs[network.name as keyof typeof configs]

  if (!config) {
    throw new Error(`No config found for network ${network.name}`)
  }
  if (!config.ifoDeployerV3) {
    // Deploy the contract
    console.log("Deploying.....")
    const ifoDeployerV3 = await IFODeployerV3.deploy({ gasLimit: 999999999 })
    await ifoDeployerV3.deployed()

    console.log('IFODeployerV3 deployed to:', ifoDeployerV3.address)

    // Write the address to a file.
    writeFileSync(
      `./deployments/${network.name}.json`,
      JSON.stringify(
        {
          IFODeployerV3: ifoDeployerV3.address,
        },
        null,
        2
      )
    )

    // Verify the contract after deployment (optional and network-specific)
    // This step is usually done on public testnets or mainnet
    if (network.name !== 'hardhat' && network.name !== 'localhost') {
      console.log('Waiting for block confirmations...')
      await ifoDeployerV3.deployTransaction.wait(6) // Wait for 6 confirmations
      await run('verify:verify', {
        address: ifoDeployerV3.address,
        constructorArguments: [
          /* constructor arguments */
        ],
      })
    }
  } else {
    const ifoDeployerV3 = IFODeployerV3.attach(config.ifoDeployerV3)
    console.log('IFODeployerV3 deployed to:', ifoDeployerV3.address)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
