import {
  Client,
  PrivateKey,
  AccountId,
  ContractCallQuery,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TokenAssociateTransaction,
  TokenId,
  TransferTransaction,
  Hbar,
} from "@hashgraph/sdk";

// Contract interaction service
export class CreatorRegistryService {
  private client: Client;
  private contractId: ContractId;
  private platformTokenId: TokenId;

  constructor() {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet";
    const contractIdString = process.env.NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID;
    const tokenIdString = process.env.NEXT_PUBLIC_PLATFORM_TOKEN_ID;

    if (!contractIdString || !tokenIdString) {
      throw new Error("Missing contract or token configuration");
    }

    this.client = network === "mainnet" 
      ? Client.forMainnet() 
      : Client.forTestnet();

    this.contractId = ContractId.fromString(contractIdString);
    this.platformTokenId = TokenId.fromString(tokenIdString);
  }

  // Check if an account is a registered creator
  async isCreator(accountId: string): Promise<boolean> {
    try {
      // Convert Hedera account ID to EVM address format
      const accountIdParts = accountId.split(".");
      const accountNum = parseInt(accountIdParts[2]);
      const evmAddress = `0x${accountNum.toString(16).padStart(40, '0')}`;

      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction("isCreator", new ContractFunctionParameters().addAddress(evmAddress));

      const result = await query.execute(this.client);
      return result.getBool(0);
    } catch (error) {
      console.error("Error checking creator status:", error);
      return false;
    }
  }

  // Get registration fee
  async getRegistrationFee(): Promise<number> {
    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction("REGISTRATION_FEE");

      const result = await query.execute(this.client);
      const fee = result.getUint256(0);
      
      // Convert from smallest unit (8 decimals) to tokens
      return Number(fee) / Math.pow(10, 8);
    } catch (error) {
      console.error("Error getting registration fee:", error);
      return 100; // Default fee
    }
  }

  // Register as creator (requires user's private key and account setup)
  async registerAsCreator(
    userAccountId: string, 
    userPrivateKey: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Set up client with user credentials
      const userClient = this.client.setOperator(
        AccountId.fromString(userAccountId),
        PrivateKey.fromStringECDSA(userPrivateKey)
      );

      // First, associate the token if not already associated
      try {
        const associateTransaction = new TokenAssociateTransaction()
          .setAccountId(userAccountId)
          .setTokenIds([this.platformTokenId]);

        await associateTransaction.execute(userClient);
      } catch (associateError) {
        // Token might already be associated, continue
        console.log("Token association might already exist:", associateError);
      }

      // Approve tokens for the contract
      const registrationFee = await this.getRegistrationFee();
      const feeInSmallestUnit = BigInt(registrationFee * Math.pow(10, 8));

      // Note: For HTS tokens, we need to use TransferTransaction with allowance
      // This is a simplified version - in practice, you'd need to handle token approvals differently
      
      // Execute the registerAsCreator function
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(300000)
        .setFunction("registerAsCreator")
        .setPayableAmount(Hbar.fromTinybars(0)); // No HBAR payment needed

      const txResponse = await transaction.execute(userClient);
      const receipt = await txResponse.getReceipt(userClient);

      if (receipt.status.toString() === "SUCCESS") {
        return {
          success: true,
          transactionId: txResponse.transactionId.toString()
        };
      } else {
        return {
          success: false,
          error: `Transaction failed with status: ${receipt.status.toString()}`
        };
      }

    } catch (error) {
      console.error("Error registering as creator:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  // Close the client connection
  close(): void {
    this.client.close();
  }
}

// Singleton instance for use across the app
let creatorRegistryService: CreatorRegistryService | null = null;

export function getCreatorRegistryService(): CreatorRegistryService {
  if (!creatorRegistryService) {
    creatorRegistryService = new CreatorRegistryService();
  }
  return creatorRegistryService;
}

// Utility function to convert Hedera account ID to EVM address
export function hederaAccountToEvmAddress(accountId: string): string {
  const parts = accountId.split(".");
  const accountNum = parseInt(parts[2]);
  return `0x${accountNum.toString(16).padStart(40, '0')}`;
}

// Utility function to convert EVM address to Hedera account ID (approximate)
export function evmAddressToHederaAccount(address: string, shard = 0, realm = 0): string {
  const addressNum = parseInt(address.slice(2), 16);
  return `${shard}.${realm}.${addressNum}`;
}