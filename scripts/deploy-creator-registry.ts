import {
    Client,
    PrivateKey,
    AccountId,
    ContractCreateFlow,
    ContractFunctionParameters,
    Hbar,
    ContractCallQuery,
    ContractId,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config();

async function main() {
    console.log("🚀 Deploying CreatorRegistry Contract to Hedera...");
    
    const accountId = process.env.ACCOUNT_ID;
    const privateKey = process.env.HEX_Encoded_Private_Key;
    const platformTokenId = process.env.PLATFORM_TOKEN_ID;
    const network = process.env.HEDERA_NETWORK || "testnet";
    
    if (!accountId || !privateKey || !platformTokenId) {
        throw new Error("Missing required environment variables");
    }
    
    console.log(`Network: ${network}`);
    console.log(`Owner Account: ${accountId}`);
    console.log(`Platform Token ID: ${platformTokenId}`);
    
    // Load compiled contract
    const artifactPath = path.join(process.cwd(), "artifacts/contracts/CreatorRegistry.sol/CreatorRegistry.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const bytecode = artifact.bytecode;
    
    console.log(`Bytecode length: ${bytecode.length} characters`);
    
    // Initialize Hedera client
    const client = network === "mainnet"
        ? Client.forMainnet()
        : Client.forTestnet();
    
    client.setOperator(
        AccountId.fromString(accountId),
        PrivateKey.fromStringECDSA(privateKey)
    );
    
    try {
        // Convert token ID to EVM address format
        const tokenIdParts = platformTokenId.split(".");
        const tokenNum = parseInt(tokenIdParts[2]);
        const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
        
        // Convert owner account ID to EVM address
        const ownerIdParts = accountId.split(".");
        const ownerNum = parseInt(ownerIdParts[2]);
        const ownerAddress = `0x${ownerNum.toString(16).padStart(40, '0')}`;
        
        console.log(`Token EVM Address: ${tokenAddress}`);
        console.log(`Owner EVM Address: ${ownerAddress}`);
        
        // Prepare constructor parameters
        const constructorParams = new ContractFunctionParameters()
            .addAddress(tokenAddress)  // Platform token address
            .addAddress(ownerAddress); // Owner address
        
        console.log("📤 Deploying contract to Hedera...");
        
        // Deploy the contract
        const contractCreateFlow = new ContractCreateFlow()
            .setGas(1000000) // Set gas limit
            .setBytecode(bytecode)
            .setConstructorParameters(constructorParams);
        
        const txResponse = await contractCreateFlow.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        const contractId = receipt.contractId;
        if (!contractId) {
            throw new Error("Contract deployment failed - no contract ID returned");
        }
        
        console.log(`✅ Contract deployed successfully!`);
        console.log(`Contract ID: ${contractId.toString()}`);
        console.log(`Transaction ID: ${txResponse.transactionId.toString()}`);
        
        // Convert contract ID to EVM address for frontend use
        const contractIdParts = contractId.toString().split(".");
        const contractNum = parseInt(contractIdParts[2]);
        const contractAddress = `0x${contractNum.toString(16).padStart(40, '0')}`;
        
        console.log(`📍 Contract EVM Address: ${contractAddress}`);
        
        // Update .env file
        const envPath = path.join(process.cwd(), ".env");
        let envContent = fs.readFileSync(envPath, "utf8");
        
        if (envContent.includes("CREATOR_REGISTRY_ADDRESS=")) {
            envContent = envContent.replace(
                /CREATOR_REGISTRY_ADDRESS=.*/,
                `CREATOR_REGISTRY_ADDRESS=${contractAddress}`
            );
        } else {
            envContent += `\nCREATOR_REGISTRY_ADDRESS=${contractAddress}\n`;
        }
        
        // Also save the Hedera contract ID for reference
        if (envContent.includes("CREATOR_REGISTRY_CONTRACT_ID=")) {
            envContent = envContent.replace(
                /CREATOR_REGISTRY_CONTRACT_ID=.*/,
                `CREATOR_REGISTRY_CONTRACT_ID=${contractId}`
            );
        } else {
            envContent += `CREATOR_REGISTRY_CONTRACT_ID=${contractId}\n`;
        }
        
        fs.writeFileSync(envPath, envContent);
        console.log(`💾 Updated .env file:`);
        console.log(`  CREATOR_REGISTRY_ADDRESS=${contractAddress}`);
        console.log(`  CREATOR_REGISTRY_CONTRACT_ID=${contractId}`);
        
        // Verify deployment by calling view functions
        console.log("🔍 Verifying contract deployment...");
        
        try {
            // Query platform token address
            const tokenQuery = new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100000)
                .setFunction("platformToken");
            
            const tokenResult = await tokenQuery.execute(client);
            const actualTokenAddress = `0x${tokenResult.getAddress(0)}`;
            
            // Query owner address
            const ownerQuery = new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100000)
                .setFunction("owner");
            
            const ownerResult = await ownerQuery.execute(client);
            const actualOwnerAddress = `0x${ownerResult.getAddress(0)}`;
            
            // Query registration fee
            const feeQuery = new ContractCallQuery()
                .setContractId(contractId)
                .setGas(100000)
                .setFunction("REGISTRATION_FEE");
            
            const feeResult = await feeQuery.execute(client);
            const registrationFee = feeResult.getUint256(0);
            
            console.log("📊 Contract Verification:");
            console.log(`  Platform Token: ${actualTokenAddress} ${actualTokenAddress.toLowerCase() === tokenAddress.toLowerCase() ? "✅" : "❌"}`);
            console.log(`  Owner: ${actualOwnerAddress} ${actualOwnerAddress.toLowerCase() === ownerAddress.toLowerCase() ? "✅" : "❌"}`);
            console.log(`  Registration Fee: ${registrationFee.toString()} (${Number(registrationFee) / Math.pow(10, 8)} tokens)`);
            
            console.log("✅ Contract verification successful!");
            
        } catch (verifyError) {
            console.log("⚠️  Contract deployed but verification failed:", verifyError);
        }
        
        console.log("🎉 Deployment complete!");
        
    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    } finally {
        client.close();
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Deployment failed:", error);
        process.exit(1);
    });