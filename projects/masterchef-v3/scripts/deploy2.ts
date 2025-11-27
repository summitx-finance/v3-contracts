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

  // deploying contracts
  console.log(`Deploying to ${networkName} network...`);




  // deploy SUMMITX if config.RSUMMITX is not set
  let summitxToken;
  if (!config.SUMMITX) {
    console.log(`deploying SUMMITX..........`);
    const WhitelistableERC20 = await ethers.getContractFactory("WhitelistableERC20");
    summitxToken = await WhitelistableERC20.deploy("SummitX", "SUMMITX", { gasLimit: 999999999 });
    await summitxToken.deployed();
    console.log("SummitX deployed to:", summitxToken.address);
  } else {
    summitxToken = await ethers.getContractAt("WhitelistableERC20", config.SUMMITX);
  }

  await tryVerify(summitxToken, ["SummitX", "SUMMITX"]);


  // const v3PeripheryDeployedContracts = await import(`@summitx/v3-periphery/deployments/${networkName}.json`);
  // const v2CoreDeployedContracts = await import(`@summitx/v2-core/deployments/${networkName}.json`);
  // const positionManager = v3PeripheryDeployedContracts.NonfungiblePositionManager;
  // let contractName;
  // // deploying MasterChefV3
  // contractName = "MasterChefV3";
  // console.log(`deploying ${contractName}..........`);
  // const MasterChefV3 = await ethers.getContractFactory(
  //   "MasterChefV3"
  // );
  // let masterChefV3;
  // if (!config.masterChefV3) {
  //   masterChefV3 = await MasterChefV3.deploy(config.SUMMITX, positionManager, v2CoreDeployedContracts.WNative);
  //   await masterChefV3.deployed();
  // } else {
  //   masterChefV3 = MasterChefV3.attach(config.masterChefV3);
  // }
  // console.log("masterChefV3 deployed to:", masterChefV3.address);

  // // deploying MasterChefV3Receiver
  // contractName = "MasterChefV3Receiver";
  // console.log(`deploying ${contractName}..........`);
  // const MasterChefV3Receiver = await ethers.getContractFactory("MasterChefV3Receiver");
  // let masterChefV3Receiver;
  // if (!config.masterChefV3ReceiverV2) {
  //   masterChefV3Receiver = await MasterChefV3Receiver.deploy(config.masterChefV3, masterChefV3.address, config.SUMMITX, config.PID); 
  //   await masterChefV3Receiver.deployed();
  // } else {
  //   masterChefV3Receiver =  MasterChefV3Receiver.attach(config.masterChefV3ReceiverV2);
  // }
  // console.log("masterChefV3Receiver deployed to:", masterChefV3Receiver.address);
  
  // await tryVerify(masterChefV3Receiver, [config.SUMMITX, positionManager]);

  // Write the address to a file.
  writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(
      {
        // MasterChefV3: masterChefV3.address,
        // MasterChefV3Receiver: masterChefV3Receiver.address,
        SUMMITX: summitxToken.address,
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
