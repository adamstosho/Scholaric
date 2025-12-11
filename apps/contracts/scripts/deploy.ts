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
  const chainId = Number(networkInfo.chainId);
  
  // Determine network details
  const networkNames: { [key: number]: string } = {
    42220: "Celo Mainnet",
    44787: "Celo Alfajores Testnet",
    11142220: "Celo Sepolia Testnet",
  };
  
  const explorerUrls: { [key: number]: string } = {
    42220: "https://celoscan.io/address",
    44787: "https://alfajores.celoscan.io/address",
    11142220: "https://celo-sepolia.blockscout.com/address",
  };
  
  const networkName = networkNames[chainId] || `Unknown Network (${chainId})`;
  const explorerBaseUrl = explorerUrls[chainId] || `https://explorer.celo.org/address`;
  const isMainnet = chainId === 42220;
  
  // Create wallet from private key
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("=".repeat(60));
  console.log(`Deploying QuizManager to ${networkName}`);
  console.log("=".repeat(60));
  console.log("Deployer address:", deployer.address);
  
  const balance = await provider.getBalance(deployer.address);
  const balanceFormatted = ethers.formatEther(balance);
  console.log("Deployer balance:", balanceFormatted, "CELO");
  
  if (balance === 0n) {
    console.log("\n⚠️  WARNING: Deployer has zero balance!");
    if (isMainnet) {
      console.log("Please fund your wallet with CELO for gas fees.");
    } else {
      console.log("Please get testnet CELO from: https://faucet.celo.org/");
    }
    throw new Error("Insufficient balance for deployment");
  }
  
  // Check minimum balance for mainnet (estimate ~0.1 CELO should be enough)
  const minBalance = isMainnet ? ethers.parseEther("0.1") : ethers.parseEther("0.01");
  if (balance < minBalance) {
    console.log(`\n⚠️  WARNING: Balance may be insufficient for deployment!`);
    console.log(`Recommended minimum: ${ethers.formatEther(minBalance)} CELO`);
  }
  
  console.log("Network:", networkName, "(Chain ID:", chainId + ")");
  console.log("=".repeat(60));

  // Deploy QuizManager
  console.log("\n📝 Deploying QuizManager contract...");
  const QuizManager = await ethers.getContractFactory("QuizManager", deployer);
  const quizManager = await QuizManager.deploy();
  await quizManager.waitForDeployment();

  const contractAddress = await quizManager.getAddress();
  console.log("✅ QuizManager deployed to:", contractAddress);

  // Get deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: chainId,
    contractName: "QuizManager",
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await provider.getBlockNumber(),
    explorer: `${explorerBaseUrl}/${contractAddress}`,
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Create safe network name for filename
  const networkNameSafe = networkName.toLowerCase().replace(/\s+/g, "-");
  const deploymentFile = path.join(
    deploymentsDir,
    `deployment-${networkNameSafe}-${Date.now()}.json`
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

