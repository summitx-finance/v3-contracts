/* eslint-disable camelcase */
import { ethers, run, network } from "hardhat";
import { configs } from "@muchfi/common/config";
import { tryVerify } from "@muchfi/common/verify";
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

  // deploying MuchFiPool contract
  const MuchFiPool = await ethers.getContractFactory("MuchFiPool");
  const muchfiPool = await MuchFiPool.deploy(config.MUCHFI, config.masterChefV2, config.admin, config.treasury, config.operator, config.PID);
  console.log("muchfiPool deployed to:", muchfiPool.address);
  
  // //verifying MuchFiPool contract
  // console.log("Verifying MuchFiPool contract...");
  // // await tryVerify(muchfiPool, [config.MUCHFI, config.masterChefV2, config.admin, config.treasury, config.operator, config.PID]);
  // console.log("MuchFiPool contract verified!");

  // deploying MuchFiFlexiblePool contract
  const MuchFiFlexiblePool = await ethers.getContractFactory("MuchFiFlexiblePool"); 
  const muchfiFlexiblePool = await MuchFiFlexiblePool.deploy(config.MUCHFI, muchfiPool.address, config.admin, config.treasury);
  console.log("muchfiFlexiblePool deployed to:", muchfiFlexiblePool.address);
 
  // //verifying MuchFiFlexiblePool contract
  // console.log("Verifying MuchFiFlexiblePool contract...");
  // // await tryVerify(muchfiFlexiblePool, [config.MUCHFI, muchfiPool.address, config.admin, config.treasury]);
  // console.log("MuchFiFlexiblePool contract verified!");

  // Write the address to a file.
  writeFileSync(
    `./deployments/${networkName}.json`,
    JSON.stringify(
      {
        MuchFiPool: muchfiPool.address,
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
