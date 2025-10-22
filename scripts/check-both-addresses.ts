import {
  Client,
  AccountId,
  ContractId,
  ContractCallQuery,
  ContractFunctionParameters,
  Hbar,
  AccountInfoQuery,
  PrivateKey,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";

dotenv.config();

async function checkBothAddresses() {
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.HEX_Encoded_Private_Key;
  const contractId = process.env.NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID;
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet";
  const evmAddressToCheck = process.env.EVM_Address;

  if (!accountId || !contractId || !evmAddressToCheck) {
    console.error("ERROR: Missing required environment variables");
    console.error("Required: ACCOUNT_ID, NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID, EVM_Address");
    process.exit(1);
  }

  console.log("Checking creator status with both address formats...\n");
  console.log("Account ID:", accountId);
  console.log("Contract ID:", contractId);
  console.log("Network:", network);
  console.log("EVM Address to check:", evmAddressToCheck);

  const client = network === "mainnet" 
    ? Client.forMainnet() 
    : Client.forTestnet();

  // Set operator - REQUIRED for queries
  if (!privateKey) {
    console.error("ERROR: HEX_Encoded_Private_Key not found in .env");
    console.error("Cannot execute queries without an operator");
    process.exit(1);
  }

  client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromStringECDSA(privateKey)
  );

  try {
    console.log("\n=== Address Formats ===");
    console.log("EVM Address to verify:", evmAddressToCheck);

    // Calculate short-form address for comparison
    const accountIdParts = accountId.split(".");
    const accountNum = parseInt(accountIdParts[2]);
    const shortFormAddress = `0x${accountNum.toString(16).padStart(40, '0')}`;
    console.log("Short-form Address (for comparison):", shortFormAddress);

    // Check with the specific EVM address
    console.log("\n=== Checking EVM Address: " + evmAddressToCheck + " ===");
    try {
      const query1 = new ContractCallQuery()
        .setContractId(ContractId.fromString(contractId))
        .setGas(100000)
        .setFunction("getCreatorStatus", new ContractFunctionParameters().addAddress(evmAddressToCheck));

      const result1 = await query1.execute(client);
      const isCreator1 = result1.getBool(0);
      console.log("✅ Query successful!");
      console.log("Is Creator:", isCreator1);
      
      if (!isCreator1) {
        console.log("\n⚠️  WARNING: This address is NOT registered as a creator!");
        console.log("This means either:");
        console.log("1. The registration transaction failed");
        console.log("2. You registered with a different address");
        console.log("3. You're querying the wrong contract");
      } else {
        console.log("\n✅ SUCCESS: This address IS registered as a creator!");
      }
    } catch (error: any) {
      console.log("❌ Error querying contract:", error.message);
      throw error;
    }

    // Also check short-form for comparison
    console.log("\n=== Checking Short-form Address (for comparison) ===");
    try {
      const query2 = new ContractCallQuery()
        .setContractId(ContractId.fromString(contractId))
        .setGas(100000)
        .setFunction("getCreatorStatus", new ContractFunctionParameters().addAddress(shortFormAddress));

      const result2 = await query2.execute(client);
      const isCreator2 = result2.getBool(0);
      console.log("Is Creator (short-form):", isCreator2);
    } catch (error: any) {
      console.log("Error with short-form address:", error.message);
    }

    console.log("\n=== Summary ===");
    console.log("Contract ID:", contractId);
    console.log("EVM Address checked:", evmAddressToCheck);
    console.log("\nIf the address shows as NOT registered, you may need to register again.");

  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    client.close();
  }
}

checkBothAddresses();
