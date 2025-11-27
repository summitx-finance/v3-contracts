/* eslint-disable camelcase */
import { ethers, run, network } from "hardhat";
import { configs } from "@summitx/common/config";
import { tryVerify } from "@summitx/common/verify";
import { writeFileSync } from "fs";

async function main() {

  let contractName;
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  const owner = (await ethers.getSigners())[0];
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
  console.log(`Deploying to ${networkName} network... with account: ${owner.address}`);


  // deploy whitelistableERC20 as RewardSUMMITX(RSUMMITX) if config.RSUMMITX is not set
  let rewardSUMMITX;
  if (!config.RSUMMITX) {
    console.log(`deploying RewardSUMMITX..........`);
    const WhitelistableERC20 = await ethers.getContractFactory("WhitelistableERC20");
    rewardSUMMITX = await WhitelistableERC20.deploy("RewardSUMMITX", "RSUMMITX", { gasLimit: 999999999 });
    await rewardSUMMITX.deployed();
    console.log("RewardSUMMITX deployed to:", rewardSUMMITX.address);
  } else {
    rewardSUMMITX = await ethers.getContractAt("WhitelistableERC20", config.RSUMMITX);
  }

  await tryVerify(rewardSUMMITX, ["RewardSUMMITX", "RSUMMITX"]);

  const v3PeripheryDeployedContracts = await import(`@summitx/v3-periphery/deployments/${networkName}.json`);
  const v2CoreDeployedContracts = await import(`@summitx/v2-core/deployments/${networkName}.json`);
  const positionManager = v3PeripheryDeployedContracts.NonfungiblePositionManager;
  // deploying MasterChefV3
  contractName = "LBPMasterChefV3";
  console.log(`deploying ${contractName}..........`);
  const LBPMasterChefV3 = await ethers.getContractFactory(
    "LBPMasterChefV3"
  );
  let lbpMasterChefV3;
  if (!config.lbpMasterChefV3) {
    lbpMasterChefV3 = await LBPMasterChefV3.deploy(rewardSUMMITX.address, positionManager, v2CoreDeployedContracts.WNative, { gasLimit: 999999999 });
    await lbpMasterChefV3.deployed();
  } else {
    lbpMasterChefV3 = LBPMasterChefV3.attach(config.lbpMasterChefV3);
  }
  console.log("masterChefV3 deployed to:", lbpMasterChefV3.address);

  await tryVerify(lbpMasterChefV3, [rewardSUMMITX.address, positionManager, v2CoreDeployedContracts.WNative]);

  // deploying MasterChefV3Receiver
  contractName = "LBPMasterChefV3ReceiverV2";
  console.log(`deploying ${contractName}..........`);
  const LBPMasterChefV3Receiver = await ethers.getContractFactory("LBPMasterChefV3ReceiverV2");
  let lbpMasterChefV3ReceiverV2;
  if (!config.lbpMasterChefV3ReceiverV2) {
    lbpMasterChefV3ReceiverV2 = await LBPMasterChefV3Receiver.deploy(lbpMasterChefV3.address, rewardSUMMITX.address, { gasLimit: 999999999 });
    await lbpMasterChefV3ReceiverV2.deployed();

    console.log("set receiver to masterChefV3");
    await lbpMasterChefV3.setReceiver(lbpMasterChefV3ReceiverV2.address, { gasLimit: 999999999 });
  } else {
    lbpMasterChefV3ReceiverV2 = LBPMasterChefV3Receiver.attach(config.lbpMasterChefV3ReceiverV2);
  }
  console.log("lbpMasterChefV3ReceiverV2 deployed to:", lbpMasterChefV3ReceiverV2.address);

  await tryVerify(lbpMasterChefV3ReceiverV2, [lbpMasterChefV3.address, rewardSUMMITX.address]);

  // deploying LBPMasterChefV3KeeperV2
  contractName = "LBPMasterChefV3KeeperV2";
  console.log(`deploying ${contractName}..........`);
  const LBPMasterChefV3KeeperV2 = await ethers.getContractFactory("LBPMasterChefV3KeeperV2");
  let lbpMasterChefV3KeeperV2;
  if (!config.lbpMasterChefV3KeeperV2) {
    lbpMasterChefV3KeeperV2 = await LBPMasterChefV3KeeperV2.deploy(lbpMasterChefV3.address, lbpMasterChefV3ReceiverV2.address
      , rewardSUMMITX.address, { gasLimit: 999999999 });
    await lbpMasterChefV3KeeperV2.deployed();
    console.log("setting operator on receiver")
    await lbpMasterChefV3ReceiverV2.setOperator(lbpMasterChefV3KeeperV2.address, { gasLimit: 999999999 });
  } else {
    lbpMasterChefV3KeeperV2 = LBPMasterChefV3KeeperV2.attach(config.lbpMasterChefV3KeeperV2);
  }
  console.log("lbpMasterChefV3KeeperV2 deployed to:", lbpMasterChefV3KeeperV2.address);
  tryVerify(lbpMasterChefV3KeeperV2, [lbpMasterChefV3.address, lbpMasterChefV3ReceiverV2.address, rewardSUMMITX.address]);

  // Write the address to a file.
  writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(
      {
        RewardSUMMITX: rewardSUMMITX.address,
        LBPMasterChefV3: lbpMasterChefV3.address,
        LBPMasterChefV3ReceiverV2: lbpMasterChefV3ReceiverV2.address,
        LBPMasterChefV3KeeperV2: lbpMasterChefV3KeeperV2.address,
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
