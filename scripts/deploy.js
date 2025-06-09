// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const FoodSupplyChain = await hre.ethers.getContractFactory("FoodSupplyChain");
  const contract = await FoodSupplyChain.deploy();

  await contract.waitForDeployment(); // ✅ Use this instead of deployed()
  console.log("Deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
