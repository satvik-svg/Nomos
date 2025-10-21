import {
    Client,
    PrivateKey,
    AccountId,
    TokenId,
    TransferTransaction,
    TokenAssociateTransaction,
    AccountBalanceQuery,
    Hbar,
    TokenInfoQuery,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const FAUCET_AMOUNTS = {
    OWNER: 10000,  // 10,000 NOMOS for owner testing
    USER: 100,     // 100 NOMOS for user testing
};

async function initializeClient() {
    const accountId = process.env.ACCOUNT_ID;
    const privateKey = process.env.HEX_Encoded_Private_Key;
    const tokenIdStr = process.env.PLATFORM_TOKEN_ID;
    const network = process.env.HEDERA_NETWORK || "testnet";

    if (!accountId || !privateKey || !tokenIdStr) {
        throw new Error("Missing required environment variables");
    }

    const client = network === "mainnet"
        ? Client.forMainnet()
        : Client.forTestnet();

    const treasuryAccountId = AccountId.fromString(accountId);
    const treasuryPrivateKey = PrivateKey.fromStringECDSA(privateKey);
    const tokenId = TokenId.fromString(tokenIdStr);

    client.setOperator(treasuryAccountId, treasuryPrivateKey);

    return { client, treasuryAccountId, treasuryPrivateKey, tokenId };
}

async function getTokenInfo() {
    const { client, tokenId } = await initializeClient();

    try {
        const tokenInfo = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(client);

        console.log("🪙 NOMOS Token Information:");
        console.log(`  Token ID: ${tokenId.toString()}`);
        console.log(`  Name: ${tokenInfo.name}`);
        console.log(`  Symbol: ${tokenInfo.symbol}`);
        console.log(`  Decimals: ${tokenInfo.decimals}`);

        const humanSupply = Number(tokenInfo.totalSupply) / Math.pow(10, tokenInfo.decimals);
        console.log(`  Total Supply: ${humanSupply.toLocaleString()} ${tokenInfo.symbol}`);

    } catch (error) {
        console.error("❌ Error getting token info:", error);
        throw error;
    } finally {
        client.close();
    }
}

async function getTreasuryBalance() {
    const { client, treasuryAccountId, tokenId } = await initializeClient();

    try {
        const balance = await new AccountBalanceQuery()
            .setAccountId(treasuryAccountId)
            .execute(client);

        const tokenBalance = balance.tokens?.get(tokenId);
        if (!tokenBalance) {
            return 0;
        }

        const humanBalance = Number(tokenBalance) / Math.pow(10, 8);
        console.log(`💰 Treasury Balance: ${humanBalance.toLocaleString()} NOMOS`);
        return humanBalance;

    } catch (error) {
        console.error("❌ Error getting treasury balance:", error);
        return 0;
    } finally {
        client.close();
    }
}

async function getAccountBalance(accountId: string) {
    const { client, tokenId } = await initializeClient();

    try {
        const balance = await new AccountBalanceQuery()
            .setAccountId(AccountId.fromString(accountId))
            .execute(client);

        const tokenBalance = balance.tokens?.get(tokenId);
        if (!tokenBalance) {
            console.log(`💰 Account ${accountId} balance: 0 NOMOS`);
            return 0;
        }

        const humanBalance = Number(tokenBalance) / Math.pow(10, 8);
        console.log(`💰 Account ${accountId} balance: ${humanBalance.toLocaleString()} NOMOS`);
        return humanBalance;

    } catch (error) {
        console.error("❌ Error getting account balance:", error);
        return 0;
    } finally {
        client.close();
    }
}

async function checkAccountAssociation(accountId: string): Promise<boolean> {
    const { client, tokenId } = await initializeClient();

    try {
        const balance = await new AccountBalanceQuery()
            .setAccountId(AccountId.fromString(accountId))
            .execute(client);

        const tokenBalance = balance.tokens?.get(tokenId);
        const isAssociated = tokenBalance !== undefined;
        console.log(`🔗 Account ${accountId} association status: ${isAssociated ? "Associated" : "Not Associated"}`);
        return isAssociated;

    } catch (error) {
        console.log(`🔗 Account ${accountId} association status: Not Associated (or error)`);
        return false;
    } finally {
        client.close();
    }
}

async function distributeFaucet(recipientAccountId: string, amount: number, faucetType: string) {
    const { client, treasuryAccountId, tokenId } = await initializeClient();

    try {
        console.log(`🚰 ${faucetType} Faucet: Distributing ${amount} NOMOS to ${recipientAccountId}...`);

        // Check if account is associated with token
        const balance = await new AccountBalanceQuery()
            .setAccountId(AccountId.fromString(recipientAccountId))
            .execute(client);

        const tokenBalance = balance.tokens?.get(tokenId);
        if (tokenBalance === undefined) {
            throw new Error(`Account ${recipientAccountId} is not associated with NOMOS token. Please associate first.`);
        }

        // Create transfer transaction
        const transferTx = new TransferTransaction()
            .addTokenTransfer(
                tokenId,
                treasuryAccountId,
                -amount * Math.pow(10, 8) // Convert to smallest unit
            )
            .addTokenTransfer(
                tokenId,
                AccountId.fromString(recipientAccountId),
                amount * Math.pow(10, 8) // Convert to smallest unit
            )
            .setMaxTransactionFee(new Hbar(10));

        const txResponse = await transferTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        if (receipt.status.toString() === "SUCCESS") {
            console.log("✅ Faucet distribution successful!");
            console.log(`Transaction ID: ${txResponse.transactionId.toString()}`);

            // Show updated balance
            const newBalance = await new AccountBalanceQuery()
                .setAccountId(AccountId.fromString(recipientAccountId))
                .execute(client);

            const newTokenBalance = newBalance.tokens?.get(tokenId);
            if (newTokenBalance) {
                const humanBalance = Number(newTokenBalance) / Math.pow(10, 8);
                console.log(`💰 New account balance: ${humanBalance.toLocaleString()} NOMOS`);
            }

        } else {
            throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
        }

    } catch (error) {
        console.error("❌ Error distributing faucet:", error);
        throw error;
    } finally {
        client.close();
    }
}

async function associateToken(accountId: string, privateKey: string) {
    const { client, tokenId } = await initializeClient();

    try {
        console.log(`🔗 Associating NOMOS token with account ${accountId}...`);

        const associateTx = new TokenAssociateTransaction()
            .setAccountId(AccountId.fromString(accountId))
            .setTokenIds([tokenId])
            .freezeWith(client);

        const signedTx = await associateTx.sign(PrivateKey.fromStringECDSA(privateKey));
        const txResponse = await signedTx.execute(client);
        await txResponse.getReceipt(client);

        console.log("✅ Token association successful!");
        console.log(`Transaction ID: ${txResponse.transactionId.toString()}`);

    } catch (error) {
        console.error("❌ Error associating token:", error);
        throw error;
    } finally {
        client.close();
    }
}

async function main() {
    const args = process.argv.slice(2);

    try {
        if (args.length === 0) {
            console.log("🚰 NOMOS Faucet Commands:");
            console.log("  npm run simple-faucet info                    - Show token info");
            console.log("  npm run simple-faucet treasury               - Show treasury balance");
            console.log("  npm run simple-faucet owner <account-id>     - Owner faucet (10,000 NOMOS)");
            console.log("  npm run simple-faucet user <account-id>      - User faucet (100 NOMOS)");
            console.log("  npm run simple-faucet balance <account-id>   - Check account balance");
            console.log("  npm run simple-faucet check <account-id>     - Check token association");
            console.log("  npm run simple-faucet associate <account-id> <private-key> - Associate token");
            return;
        }

        const command = args[0];

        switch (command) {
            case "info":
                await getTokenInfo();
                break;

            case "treasury":
                await getTreasuryBalance();
                break;

            case "owner":
                if (args.length < 2) {
                    console.log("Usage: npm run simple-faucet owner <account-id>");
                    return;
                }
                await distributeFaucet(args[1], FAUCET_AMOUNTS.OWNER, "Owner");
                break;

            case "user":
                if (args.length < 2) {
                    console.log("Usage: npm run simple-faucet user <account-id>");
                    return;
                }
                await distributeFaucet(args[1], FAUCET_AMOUNTS.USER, "User");
                break;

            case "balance":
                if (args.length < 2) {
                    console.log("Usage: npm run simple-faucet balance <account-id>");
                    return;
                }
                await getAccountBalance(args[1]);
                break;

            case "check":
                if (args.length < 2) {
                    console.log("Usage: npm run simple-faucet check <account-id>");
                    return;
                }
                await checkAccountAssociation(args[1]);
                break;

            case "associate":
                if (args.length < 3) {
                    console.log("Usage: npm run simple-faucet associate <account-id> <private-key>");
                    return;
                }
                await associateToken(args[1], args[2]);
                break;

            default:
                console.log("❌ Unknown command. Run without arguments to see available commands.");
        }

    } catch (error) {
        console.error("💥 Command failed:", error);
        process.exit(1);
    }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}