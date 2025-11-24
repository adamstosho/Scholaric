import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  // Check if PRIVATE_KEY is set
  if (!process.env.PRIVATE_KEY) {
    throw new Error(
      "PRIVATE_KEY not found in .env file.\n" +
      "Please add your private key to apps/contracts/.env:\n" +
      "PRIVATE_KEY=your_private_key_here"
    );
  }

  // Get network provider
  const provider = ethers.provider;
  const networkInfo = await provider.getNetwork();
  
  // Create wallet from private key
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("=".repeat(60));
  console.log("Deploying QuizManager to Celo Sepolia Testnet");
  console.log("=".repeat(60));
  console.log("Deployer address:", deployer.address);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "CELO");
  
  if (balance === 0n) {
    console.log("\n⚠️  WARNING: Deployer has zero balance!");
    console.log("Please get testnet CELO from: https://faucet.celo.org/");
    throw new Error("Insufficient balance for deployment");
  }
  
  console.log("Network:", networkInfo.name, "(Chain ID:", Number(networkInfo.chainId) + ")");
  console.log("=".repeat(60));

  // Deploy QuizManager
  console.log("\n📝 Deploying QuizManager contract...");
  const QuizManager = await ethers.getContractFactory("QuizManager", deployer);
  const quizManager = await QuizManager.deploy();
  await quizManager.waitForDeployment();

  const contractAddress = await quizManager.getAddress();
  console.log("✅ QuizManager deployed to:", contractAddress);

  // Get deployment info (reuse networkInfo)
  const deploymentInfo = {
    network: networkInfo.name,
    chainId: Number(networkInfo.chainId),
    contractName: "QuizManager",
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await provider.getBlockNumber(),
    explorer: `https://celo-sepolia.blockscout.com/address/${contractAddress}`,
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `deployment-${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to:", deploymentFile);
  console.log("\n" + "=".repeat(60));
  console.log("Deployment Summary:");
  console.log("=".repeat(60));
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("=".repeat(60));
  console.log("\n🔍 View on explorer:", deploymentInfo.explorer);
  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

