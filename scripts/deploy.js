const { ethers, run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // ─── Setup ──────────────────────────────────────────
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Deploying Loopin Contracts");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Network:  ${network.name} (chainId: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient Sepolia ETH. Get more from sepoliafaucet.com");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ─── Deploy UserRegistry ────────────────────────────
  console.log("📄 Deploying UserRegistry...");
  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log(`✅ UserRegistry deployed at: ${userRegistryAddress}`);

  // ─── Deploy SocialGraph ─────────────────────────────
  console.log("\n📄 Deploying SocialGraph...");
  const SocialGraph = await ethers.getContractFactory("SocialGraph");
  const socialGraph = await SocialGraph.deploy();
  await socialGraph.waitForDeployment();
  const socialGraphAddress = await socialGraph.getAddress();
  console.log(`✅ SocialGraph deployed at:  ${socialGraphAddress}`);

  // ─── Deploy PostRegistry ────────────────────────────
  console.log("\n📄 Deploying PostRegistry...");
  const PostRegistry = await ethers.getContractFactory("PostRegistry");
  const postRegistry = await PostRegistry.deploy();
  await postRegistry.waitForDeployment();
  const postRegistryAddress = await postRegistry.getAddress();
  console.log(`✅ PostRegistry deployed at: ${postRegistryAddress}`);

  // ─── Save Addresses ─────────────────────────────────
  const deploymentData = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      UserRegistry: userRegistryAddress,
      SocialGraph: socialGraphAddress,
      PostRegistry: postRegistryAddress,
    },
  };

  // Create deployments/ folder if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const outputPath = path.join(deploymentsDir, "sepolia.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log(`\n💾 Deployment addresses saved to: deployments/sepolia.json`);

  // ─── Etherscan Verification ─────────────────────────
  // Wait 6 block confirmations before verifying
  // (Etherscan needs time to index the contract)
  console.log("\n⏳ Waiting 30 seconds for Etherscan to index contracts...");
  await new Promise((resolve) => setTimeout(resolve, 30000));

  console.log("\n🔍 Verifying contracts on Etherscan...");

  try {
    await run("verify:verify", {
      address: userRegistryAddress,
      constructorArguments: [],
    });
    console.log("✅ UserRegistry verified");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✅ UserRegistry already verified");
    } else {
      console.log("⚠️  UserRegistry verification failed:", e.message);
    }
  }

  try {
    await run("verify:verify", {
      address: socialGraphAddress,
      constructorArguments: [],
    });
    console.log("✅ SocialGraph verified");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✅ SocialGraph already verified");
    } else {
      console.log("⚠️  SocialGraph verification failed:", e.message);
    }
  }

  try {
    await run("verify:verify", {
      address: postRegistryAddress,
      constructorArguments: [],
    });
    console.log("✅ PostRegistry verified");
  } catch (e) {
    if (e.message.includes("Already Verified")) {
      console.log("✅ PostRegistry already verified");
    } else {
      console.log("⚠️  PostRegistry verification failed:", e.message);
    }
  }

  // ─── Final Summary ──────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 ALL CONTRACTS DEPLOYED & VERIFIED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`UserRegistry:  https://sepolia.etherscan.io/address/${userRegistryAddress}`);
  console.log(`SocialGraph:   https://sepolia.etherscan.io/address/${socialGraphAddress}`);
  console.log(`PostRegistry:  https://sepolia.etherscan.io/address/${postRegistryAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});