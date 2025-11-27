/* eslint-disable camelcase */
import { ethers, run, network } from "hardhat";
import { configs } from "@summitx/common/config";
import { tryVerify } from "@summitx/common/verify";
import { writeFileSync } from "fs";

async function main() {
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  const config = configs[networkName as keyof typeof configs];
  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }
  // contract variables
  // var redeployMasterChefV3 = 
  //   config.WNATIVE || config.SUMMITX || config.masterChefV3 === undefined || config.masterChefV3 === '';
  
  // Compile contracts.
  await run("compile");
  console.log("Compiled contracts...");

  //deploying contracts
  console.log(`Deploying to ${networkName} network...`);

  const v3PeripheryDeployedContracts = await import(`@summitx/v3-periphery/deployments/${networkName}.json`);
  const v2CoreDeployedContracts = await import(`@summitx/v2-core/deployments/${networkName}.json`);
  const positionManager = v3PeripheryDeployedContracts.NonfungiblePositionManager;
  var contractName;
  // deploying MasterChefV3
  contractName = "MasterChefV3";
  console.log(`deploying ${contractName}..........`);
  var MasterChefV3 = await ethers.getContractFactory(
    "MasterChefV3"
  );
  var masterChefV3;
  if (!config.masterChefV3) {
    masterChefV3 = await MasterChefV3.deploy(config.SUMMITX, positionManager, v2CoreDeployedContracts.WNative, { gasLimit: 999999999 });
    await masterChefV3.deployed();
  } else {
    masterChefV3 = await MasterChefV3.attach(config.masterChefV3);
  }
  console.log("masterChefV3 deployed to:", masterChefV3.address);

  // deploying MasterChefV3Receiver
  contractName = "MasterChefV3Receiver";
  console.log(`deploying ${contractName}..........`);
  var MasterChefV3Receiver = await ethers.getContractFactory("MasterChefV3Receiver");
  var masterChefV3Receiver;
  if (!config.masterChefV3Receiver) {
    masterChefV3Receiver = await MasterChefV3Receiver.deploy(config.masterChefV2, masterChefV3.address, config.SUMMITX, config.PID, { gasLimit: 999999999 });
    await masterChefV3Receiver.deployed();
  } else {
    masterChefV3Receiver = await MasterChefV3Receiver.attach(config.masterChefV3Receiver);
  }
  console.log("masterChefV3Receiver deployed to:", masterChefV3Receiver.address);
  // // await tryVerify(masterChefV3, [config.SUMMITX, positionManager]);

  // Write the address to a file.
  writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(
      {
        MasterChefV3: masterChefV3.address,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
