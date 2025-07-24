import { verifyContract } from "@summitx/common/verify";
import { sleep } from "@summitx/common/sleep";
import { configs } from "@summitx/common/config";
import { network } from "hardhat";

async function main() {
  const networkName = network.name;
  const config = configs[networkName as keyof typeof configs];

  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }
  const deployedContracts_lbpMasterchef_v3 = await import(`@summitx/lbp-masterchef-v3/deployments/${networkName}.json`);
  const deployedContracts_v3_periphery = await import(`@summitx/v3-periphery/deployments/${networkName}.json`);
  const deployedContracts_v2_core = await import(`@summitx/v2-core/deployments/${networkName}.json`);
  
  
  // Verify RewardSUMMITX which is WhitelistableERC20
  console.log("Verify RewardSUMMITX");
  await verifyContract(config.RSUMMITX, ["RewardSUMMITX", "RSUMMITX"]);
  

  console.log("Verify RewardSUMMITX");
  await verifyContract(config.RSUMMITX, ["RewardSUMMITX", "RSUMMITX"]);

  // Verify masterChefV3
  // console.log("Verify masterChefV3");
  // await verifyContract(deployedContracts_lbpMasterchef_v3.LBPMasterChefV3, [
  //   config.RSUMMITX,
  //   deployedContracts_v3_periphery.NonfungiblePositionManager,
  //   deployedContracts_v2_core.WNative,
  // ]);
  // await sleep(10000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
