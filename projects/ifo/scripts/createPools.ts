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
  if (!ifoConfig) {
    throw new Error(`No config found for network ${network.name}`)
  }
  let ifoAddress = ifoConfig.ifoAddress;
  if (!ifoAddress) {
    throw new Error(`No ifoAddress found for network ${network.name}`)
  }

  const ifo = await ethers.getContractAt("IFOInitializableV3", ifoAddress);
  // set pools from config

  for(let pool of ifoConfig.pools) {
    await ifo.setPool(
      pool.offeringAmountPool,
      pool.raisingAmountPool,
      pool.limitPerUserInLP,
      pool.hasTax,
      pool.pid
    );

    console.log(`Pool ${pool.pid} set`);
  }


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
