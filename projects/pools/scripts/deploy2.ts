/* eslint-disable camelcase */
import { ethers, run, network } from "hardhat";
import { configs } from "@summitx/common/config";
import { tryVerify } from "@summitx/common/verify";
import { writeFileSync } from "fs";

async function main() {
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  // Check if the network is supported.
  console.log(`Deploying to ${networkName} network...`);

  // Compile contracts.
  await run("compile");
  console.log("Compiled contracts...");

  const config = configs[networkName as keyof typeof configs];
  if (!config) {
    throw new Error(`No config found for network ${networkName}`);
  }

  // deploying SummitXPool contract
  const SummitXPool = await ethers.getContractFactory("SummitXPool");
  const summitxPool = await SummitXPool.deploy(config.SUMMITX, config.masterChefV2, config.admin, config.treasury, config.operator, config.PID);
  console.log("summitxPool deployed to:", summitxPool.address);
  
  // //verifying SummitXPool contract
  // console.log("Verifying SummitXPool contract...");
  // // await tryVerify(summitxPool, [config.SUMMITX, config.masterChefV2, config.admin, config.treasury, config.operator, config.PID]);
  // console.log("SummitXPool contract verified!");

  // deploying SummitXFlexiblePool contract
  const SummitXFlexiblePool = await ethers.getContractFactory("SummitXFlexiblePool"); 
  const summitxFlexiblePool = await SummitXFlexiblePool.deploy(config.SUMMITX, summitxPool.address, config.admin, config.treasury);
  console.log("summitxFlexiblePool deployed to:", summitxFlexiblePool.address);
 
  // //verifying SummitXFlexiblePool contract
  // console.log("Verifying SummitXFlexiblePool contract...");
  // // await tryVerify(summitxFlexiblePool, [config.SUMMITX, summitxPool.address, config.admin, config.treasury]);
  // console.log("SummitXFlexiblePool contract verified!");

  // Write the address to a file.
  writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(
      {
        SummitXPool: summitxPool.address,
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
