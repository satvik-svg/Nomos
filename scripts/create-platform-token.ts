import {
    Client,
    PrivateKey,
    AccountId,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    Hbar,
    TokenInfoQuery,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
dotenv.config();

interface TokenConfig {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
    maxSupply: number;
}

const PLATFORM_TOKEN_CONFIG: TokenConfig = {
    name: "NOMOS",
    symbol: "NOMOS",
    decimals: 8,
    initialSupply: 10_000_000, // 10 million tokens for faucet distribution
    maxSupply: 10_000_000, // Fixed supply
};

async function createPlatformToken(): Promise<string> {
    // Validate environment variables
    const accountId = process.env.ACCOUNT_ID;
    const privateKey = process.env.HEX_Encoded_Private_Key;
    const network = process.env.HEDERA_NETWORK || "testnet";

    if (!accountId || !privateKey) {
        throw new Error("Missing required environment variables: ACCOUNT_ID and HEX_Encoded_Private_Key");
    }

    console.log("🚀 Creating Platform Token...");
    console.log(`Network: ${network}`);
    console.log(`Account ID: ${accountId}`);
    console.log(`Token Config:`, PLATFORM_TOKEN_CONFIG);

    // Initialize Hedera client
    const client = network === "mainnet"
        ? Client.forMainnet()
        : Client.forTestnet();

    client.setOperator(
        AccountId.fromString(accountId),
        PrivateKey.fromStringECDSA(privateKey)
    );

    try {
        // Create the token
        const tokenCreateTx = new TokenCreateTransaction()
            .setTokenName(PLATFORM_TOKEN_CONFIG.name)
            .setTokenSymbol(PLATFORM_TOKEN_CONFIG.symbol)
            .setDecimals(PLATFORM_TOKEN_CONFIG.decimals)
            .setInitialSupply(PLATFORM_TOKEN_CONFIG.initialSupply * Math.pow(10, PLATFORM_TOKEN_CONFIG.decimals))
            .setTokenType(TokenType.FungibleCommon)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(PLATFORM_TOKEN_CONFIG.maxSupply * Math.pow(10, PLATFORM_TOKEN_CONFIG.decimals))
            .setTreasuryAccountId(AccountId.fromString(accountId))
            .setAdminKey(PrivateKey.fromStringECDSA(privateKey))
            .setSupplyKey(PrivateKey.fromStringECDSA(privateKey))
            .setFreezeDefault(false)
            .setMaxTransactionFee(new Hbar(30)); // Set max fee for token creation

        console.log("📝 Submitting token creation transaction...");

        // Submit the transaction
        const tokenCreateSubmit = await tokenCreateTx.execute(client);
        const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);

        const tokenId = tokenCreateReceipt.tokenId;
        if (!tokenId) {
            throw new Error("Token creation failed - no token ID returned");
        }

        console.log(`✅ Token created successfully!`);
        console.log(`Token ID: ${tokenId.toString()}`);
        console.log(`Transaction ID: ${tokenCreateSubmit.transactionId.toString()}`);

        // Verify token creation by querying token info
        console.log("🔍 Verifying token creation...");
        const tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);

        console.log("📊 Token Information:");
        console.log(`  Name: ${tokenInfo.name}`);
        console.log(`  Symbol: ${tokenInfo.symbol}`);
        console.log(`  Decimals: ${tokenInfo.decimals}`);
        console.log(`  Total Supply: ${tokenInfo.totalSupply.toString()}`);
        console.log(`  Max Supply: ${tokenInfo.maxSupply?.toString() || "N/A"}`);
        console.log(`  Treasury Account: ${tokenInfo.treasuryAccountId?.toString()}`);

        return tokenId.toString();

    } catch (error) {
        console.error("❌ Error creating token:", error);
        throw error;
    } finally {
        client.close();
    }
}

async function updateEnvironmentFile(tokenId: string): Promise<void> {
    const envPath = path.join(process.cwd(), ".env");

    try {
        // Read current .env file
        let envContent = fs.readFileSync(envPath, "utf8");

        // Update or add PLATFORM_TOKEN_ID
        if (envContent.includes("PLATFORM_TOKEN_ID=")) {
            envContent = envContent.replace(
                /PLATFORM_TOKEN_ID=.*/,
                `PLATFORM_TOKEN_ID=${tokenId}`
            );
        } else {
            envContent += `\nPLATFORM_TOKEN_ID=${tokenId}\n`;
        }

        // Write updated content back to .env file
        fs.writeFileSync(envPath, envContent);

        console.log(`💾 Updated .env file with PLATFORM_TOKEN_ID=${tokenId}`);

    } catch (error) {
        console.error("❌ Error updating .env file:", error);
        throw error;
    }
}

async function main(): Promise<void> {
    try {
        console.log("🎯 Starting Platform Token Creation Process");
        console.log("=".repeat(50));

        const tokenId = await createPlatformToken();
        await updateEnvironmentFile(tokenId);

        console.log("=".repeat(50));
        console.log("🎉 Platform Token Creation Complete!");
        console.log(`Token ID: ${tokenId}`);
        console.log("The token ID has been saved to your .env file.");

    } catch (error) {
        console.error("💥 Token creation failed:", error);
        process.exit(1);
    }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { createPlatformToken, updateEnvironmentFile, PLATFORM_TOKEN_CONFIG };