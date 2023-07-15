import { ethers } from "hardhat";

async function main() {

  // The old way of deploying contracts
  // const TokenEx = await ethers.getContractFactory("TokenExchange");
  // const tokenEx = await TokenEx.deploy();
  // await tokenEx.waitForDeployment();

  // The new way of deploying contracts    Name of Contract, Constructor Arguments, Overrides 
  const tokenEx = await ethers.deployContract("TokenExchange", [], {});

  await tokenEx.waitForDeployment();

  console.log(`TokenEx deployed to ${tokenEx.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
