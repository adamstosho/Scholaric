import { run } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable is required");
  }

  console.log("=".repeat(60));
  console.log("Verifying QuizManager on Celo Sepolia");
  console.log("=".repeat(60));
  console.log("Contract address:", contractAddress);
  console.log("=".repeat(60));

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      network: "sepolia",
    });

    console.log("\n✅ Contract verified successfully!");
    console.log("🔍 View on explorer: https://celo-sepolia.blockscout.com/address/" + contractAddress);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified!");
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error);
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

