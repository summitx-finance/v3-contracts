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
  const deployedContracts_masterchef_v3 = await import(`@summitx/masterchef-v3/deployments/${networkName}.json`);
  const deployedContracts_v3_periphery = await import(`@summitx/v3-periphery/deployments/${networkName}.json`);
  const deployedContracts_v2_core = await import(`@summitx/v2-core/deployments/${networkName}.json`);
  // Verify masterChefV3
  console.log("Verify masterChefV3");
  await verifyContract(deployedContracts_masterchef_v3.MasterChefV3, [
    config.SUMMITX,
    deployedContracts_v3_periphery.NonfungiblePositionManager,
    deployedContracts_v2_core.WNative,
  ]);
  await sleep(10000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
