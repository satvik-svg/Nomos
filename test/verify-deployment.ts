import {
    Client,
    PrivateKey,
    AccountId,
    ContractCallQuery,
    ContractId,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import assert from "assert";

// Load environment variables
dotenv.config();

async function verifyDeployedContract() {
    console.log("🧪 Verifying Deployed CreatorRegistry Contract...");
    
    const accountId = process.env.ACCOUNT_ID;
    const privateKey = process.env.HEX_Encoded_Private_Key;
    const contractIdStr = process.env.CREATOR_REGISTRY_CONTRACT_ID;
    const platformTokenId = process.env.PLATFORM_TOKEN_ID;
    const network = process.env.HEDERA_NETWORK || "testnet";
    
    if (!accountId || !privateKey || !contractIdStr || !platformTokenId) {
        throw new Error("Missing required environment variables");
    }
    
    console.log(`Network: ${network}`);
    console.log(`Contract ID: ${contractIdStr}`);
    console.log(`Platform Token ID: ${platformTokenId}`);
    
    // Initialize Hedera client
    const client = network === "mainnet"
        ? Client.forMainnet()
        : Client.forTestnet();
    
    client.setOperator(
        AccountId.fromString(accountId),
        PrivateKey.fromStringECDSA(privateKey)
    );
    
    try {
        const contractId = ContractId.fromString(contractIdStr);
        
        // Convert expected addresses
        const tokenIdParts = platformTokenId.split(".");
        const tokenNum = parseInt(tokenIdParts[2]);
        const expectedTokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
        
        const ownerIdParts = accountId.split(".");
        const ownerNum = parseInt(ownerIdParts[2]);
        const expectedOwnerAddress = `0x${ownerNum.toString(16).padStart(40, '0')}`;
        
        console.log(`Expected Token Address: ${expectedTokenAddress}`);
        console.log(`Expected Owner Address: ${expectedOwnerAddress}`);
        
        // Test 1: Query platform token address
        console.log("\n🧪 Test 1: Platform token address");
        
        const tokenQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("platformToken");
        
        const tokenResult = await tokenQuery.execute(client);
        const actualTokenAddress = `0x${tokenResult.getAddress(0)}`;
        
        assert.strictEqual(
            actualTokenAddress.toLowerCase(), 
            expectedTokenAddress.toLowerCase(), 
            "Platform token address should match"
        );
        
        console.log(`✅ Platform token address: ${actualTokenAddress}`);
        
        // Test 2: Query owner address
        console.log("\n🧪 Test 2: Owner address");
        
        const ownerQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("owner");
        
        const ownerResult = await ownerQuery.execute(client);
        const actualOwnerAddress = `0x${ownerResult.getAddress(0)}`;
        
        assert.strictEqual(
            actualOwnerAddress.toLowerCase(), 
            expectedOwnerAddress.toLowerCase(), 
            "Owner address should match"
        );
        
        console.log(`✅ Owner address: ${actualOwnerAddress}`);
        
        // Test 3: Query registration fee
        console.log("\n🧪 Test 3: Registration fee");
        
        const feeQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("REGISTRATION_FEE");
        
        const feeResult = await feeQuery.execute(client);
        const registrationFee = feeResult.getUint256(0);
        const expectedFee = 100 * Math.pow(10, 8); // 100 tokens with 8 decimals
        
        assert.strictEqual(
            registrationFee.toString(), 
            expectedFee.toString(), 
            "Registration fee should be 100 tokens"
        );
        
        console.log(`✅ Registration fee: ${registrationFee.toString()} (${Number(registrationFee) / Math.pow(10, 8)} tokens)`);
        
        // Test 4: Query creator status for non-registered address
        console.log("\n🧪 Test 4: Creator status for non-registered address");
        
        const statusQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("isCreator", new ContractFunctionParameters().addAddress(expectedOwnerAddress));
        
        const statusResult = await statusQuery.execute(client);
        const isCreator = statusResult.getBool(0);
        
        // Owner should not be registered as creator initially
        assert.strictEqual(isCreator, false, "Owner should not be registered as creator initially");
        
        console.log(`✅ Creator status for owner: ${isCreator}`);
        
        // Test 5: Query contract balance
        console.log("\n🧪 Test 5: Contract balance");
        
        const balanceQuery = new ContractCallQuery()
            .setContractId(contractId)
            .setGas(100000)
            .setFunction("getContractBalance");
        
        const balanceResult = await balanceQuery.execute(client);
        const contractBalance = balanceResult.getUint256(0);
        
        // Contract should have zero balance initially
        assert.strictEqual(contractBalance.toString(), "0", "Contract should have zero balance initially");
        
        console.log(`✅ Contract balance: ${contractBalance.toString()}`);
        
        console.log("\n🎉 All contract verification tests passed!");
        
    } catch (error) {
        console.error("❌ Contract verification failed:", error);
        throw error;
    } finally {
        client.close();
    }
}

// Import ContractFunctionParameters for the test
import { ContractFunctionParameters } from "@hashgraph/sdk";

// Run tests if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    verifyDeployedContract()
        .then(() => {
            console.log("✅ Contract verification completed successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Contract verification failed:", error);
            process.exit(1);
        });
}

export { verifyDeployedContract };