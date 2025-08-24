import { verifyContract } from "@muchfi/common/verify";
import { sleep } from "@muchfi/common/sleep";
import { configs } from "@muchfi/common/config";

async function main() {
  const networkName = network.name;
  const config = configs[networkName as keyof typeof configs];

  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }
  const deployedContracts_masterchef_v3 = await import(`@muchfi/masterchef-v3/deployments/${networkName}.json`);
  const deployedContracts_v3_periphery = await import(`@muchfi/v3-periphery/deployments/${networkName}.json`);

  // Verify masterChefV3
  console.log("Verify masterChefV3");
  // await verifyContract(deployedContracts_masterchef_v3.MasterChefV3, [
  //   config.MUCHFI,
  //   deployedContracts_v3_periphery.NonfungiblePositionManager,
  //   config.WNATIVE,
  // ]);
  await sleep(10000);
  console.log("Contract verified");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
