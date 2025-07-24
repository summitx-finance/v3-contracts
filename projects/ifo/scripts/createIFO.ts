import { ethers, run, network } from "hardhat";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { configs } from "@summitx/common/config";

async function main() {

const config = configs[network.name as keyof typeof configs]

  // Get the Contract Factory
  const IFODeployerV3 = await ethers.getContractFactory("IFODeployerV3");

  const deployedContractsIFODeployer = await import(`@summitx/ifo/deployments/${network.name}.json`)
  
  // Deploy the contract
  const ifoDeployerV3 = IFODeployerV3.attach(deployedContractsIFODeployer.IFODeployerV3);


  // call createIFO function on ifoDeployerV3

const ifoConfig = config.ifos[0]
if(!ifoConfig) {
  throw new Error(`No config found for network ${network.name}`)
}
let ifoAddress = ifoConfig.ifoAddress;
if(!ifoAddress) {
  console.log('Deploying IFO')
console.log(ifoConfig)

 let result = await ifoDeployerV3.createIFO(
  ifoConfig.lpToken,
  ifoConfig.offeringToken,
  ifoConfig.startBlock,
  ifoConfig.endBlock,
  ifoConfig.adminAddress,
 )

 const receipt = await result.wait()
 console.log("IFO deployed at block:", receipt.blockNumber)
 console.log('receipt:', receipt?.logs[2] as any)
 let ifoAddress = (receipt?.logs? ([2] as any) : []).topics[1]

  console.log("IFO deployed to:", ifoAddress);


  ifoAddress = await ethers.getContractAt("IFOInitializableV3", ifoAddress);
}

const ifo = await ethers.getContractAt("IFOInitializableV3", ifoAddress);
  
  

  // Verify the contract after deployment (optional and network-specific)
  // This step is usually done on public testnets or mainnet
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    // await ifoDeployerV3.deployTransaction.wait(6); // Wait for 6 confirmations
    await run("verify:verify", {
      address: ifo.address,
      contractName: "IFOInitializableV3",
      constructorArguments: [/* constructor arguments */],
    });
  }


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
