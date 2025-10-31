const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ProofOfPromptRegistry...");

  const RegistryFactory = await ethers.getContractFactory("ProofOfPromptRegistry");
  const registry = await RegistryFactory.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log("ProofOfPromptRegistry deployed to:", address);
  console.log("Save this address to your .env file as VITE_CONTRACT_ADDRESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
