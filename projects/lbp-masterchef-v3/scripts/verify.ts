import { verifyContract } from "@muchfi/common/verify";
import { sleep } from "@muchfi/common/sleep";
import { configs } from "@muchfi/common/config";
import { network } from "hardhat";

async function main() {
  const networkName = network.name;
  const config = configs[networkName as keyof typeof configs];

  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }
  const deployedContracts_lbpMasterchef_v3 = await import(`@muchfi/lbp-masterchef-v3/deployments/${networkName}.json`);
  const deployedContracts_v3_periphery = await import(`@muchfi/v3-periphery/deployments/${networkName}.json`);
  const deployedContracts_v2_core = await import(`@muchfi/v2-core/deployments/${networkName}.json`);
  
  
  // Verify RewardMUCHFI which is WhitelistableERC20
  console.log("Verify RewardMUCHFI");
  await verifyContract(config.RMUCHFI, ["RewardMUCHFI", "RMUCHFI"]);
  

  console.log("Verify RewardMUCHFI");
  await verifyContract(config.RMUCHFI, ["RewardMUCHFI", "RMUCHFI"]);

  // Verify masterChefV3
  // console.log("Verify masterChefV3");
  // await verifyContract(deployedContracts_lbpMasterchef_v3.LBPMasterChefV3, [
  //   config.RMUCHFI,
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
