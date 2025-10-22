import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🚀 Deploying CreatorRegistryV4 to Hedera...\n');

  // Get configuration from environment
  const platformTokenId = process.env.NEXT_PUBLIC_PLATFORM_TOKEN_ID;
  const ownerAccountId = process.env.ACCOUNT_ID;

  if (!platformTokenId) {
    throw new Error('NEXT_PUBLIC_PLATFORM_TOKEN_ID not set in .env');
  }

  if (!ownerAccountId) {
    throw new Error('ACCOUNT_ID not set in .env');
  }

  // Convert Hedera token ID to EVM address
  // Format: 0.0.xxxxx -> 0x + hex(xxxxx) padded to 40 chars
  const tokenNum = platformTokenId.split('.')[2];
  const tokenAddress = '0x' + parseInt(tokenNum).toString(16).padStart(40, '0');

  // Convert Hedera account ID to EVM address
  const accountNum = ownerAccountId.split('.')[2];
  const ownerAddress = '0x' + parseInt(accountNum).toString(16).padStart(40, '0');

  console.log('Configuration:');
  console.log('- Platform Token ID:', platformTokenId);
  console.log('- Platform Token Address:', tokenAddress);
  console.log('- Owner Account ID:', ownerAccountId);
  console.log('- Owner Address:', ownerAddress);
  console.log('- Network:', process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet');
  console.log();

  // Get the contract factory
  const CreatorRegistry = await ethers.getContractFactory('CreatorRegistryV4');

  console.log('📝 Deploying contract...');
  
  // Deploy the contract
  const creatorRegistry = await CreatorRegistry.deploy(tokenAddress, ownerAddress);
  
  console.log('⏳ Waiting for deployment...');
  await creatorRegistry.waitForDeployment();

  const contractAddress = await creatorRegistry.getAddress();
  console.log('✅ Contract deployed!');
  console.log();

  // Convert EVM address back to Hedera format for display
  const contractNum = parseInt(contractAddress.slice(2), 16);
  const contractId = `0.0.${contractNum}`;

  console.log('📋 Deployment Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Contract Address (EVM):', contractAddress);
  console.log('Contract ID (Hedera):', contractId);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();

  console.log('🔍 Verifying deployment...');
  
  // Verify contract functions
  const registrationFee = await creatorRegistry.REGISTRATION_FEE();
  const owner = await creatorRegistry.owner();
  const token = await creatorRegistry.platformToken();

  console.log('✅ Contract verification:');
  console.log('- Registration Fee:', registrationFee.toString(), '(100 tokens with 8 decimals)');
  console.log('- Owner:', owner);
  console.log('- Platform Token:', token);
  console.log();

  console.log('📝 Next Steps:');
  console.log('1. Update your .env file with:');
  console.log(`   NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID=${contractId}`);
  console.log();
  console.log('2. Restart your development server');
  console.log();
  console.log('3. Test the contract:');
  console.log('   npx hardhat run scripts/test-contract-functions.ts --network testnet');
  console.log();
  console.log('4. Verify on HashScan:');
  console.log(`   https://hashscan.io/testnet/contract/${contractId}`);
  console.log();

  console.log('🎉 Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
