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
  private contractId: ContractId;
  private platformTokenId: TokenId;
  private network: string;

  constructor() {
    this.network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet";
    const contractIdString = process.env.NEXT_PUBLIC_CREATOR_REGISTRY_CONTRACT_ID;
    const tokenIdString = process.env.NEXT_PUBLIC_PLATFORM_TOKEN_ID;

    if (!contractIdString || !tokenIdString) {
      throw new Error("Missing contract or token configuration");
    }

    this.contractId = ContractId.fromString(contractIdString);
    this.platformTokenId = TokenId.fromString(tokenIdString);
  }

  /**
   * Get a client instance (without operator for queries)
   */
  private getClient(): Client {
    return this.network === "mainnet" 
      ? Client.forMainnet() 
      : Client.forTestnet();
  }

  // Check if an account is a registered creator
  async isCreator(accountId: string, evmAddressOverride?: string): Promise<boolean> {
    const client = this.getClient();
    
    // Set a temporary operator for queries using environment variables if available
    try {
      const operatorId = process.env.ACCOUNT_ID;
      const operatorKey = process.env.HEX_Encoded_Private_Key;
      
      if (operatorId && operatorKey) {
        const { PrivateKey, AccountId: HederaAccountId } = await import("@hashgraph/sdk");
        client.setOperator(
          HederaAccountId.fromString(operatorId),
          PrivateKey.fromStringECDSA(operatorKey)
        );
      }
    } catch (error) {
      console.warn('Could not set operator for query, will use payment instead:', error);
    }
    
    try {
      // Use provided EVM address or try to get it from localStorage/env
      let evmAddress = evmAddressOverride;
      
      if (!evmAddress) {
        // Try to get from localStorage if in browser
        if (typeof window !== 'undefined') {
          evmAddress = localStorage.getItem(`evm_address_${accountId}`) || undefined;
        }
        
        // Try environment variable as fallback
        if (!evmAddress) {
          evmAddress = process.env.NEXT_PUBLIC_EVM_ADDRESS;
        }
        
        // Last resort: calculate from account number (less accurate)
        if (!evmAddress) {
          const accountIdParts = accountId.split(".");
          const accountNum = parseInt(accountIdParts[2]);
          evmAddress = `0x${accountNum.toString(16).padStart(40, '0')}`;
          console.warn('Using calculated EVM address. For accurate results, set NEXT_PUBLIC_EVM_ADDRESS or store in localStorage.');
        }
      }

      console.log('Querying contract for creator status:', {
        contractId: this.contractId.toString(),
        accountId,
        evmAddress,
        network: this.network
      });

      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction("getCreatorStatus", new ContractFunctionParameters().addAddress(evmAddress))
        .setQueryPayment(new Hbar(1)); // Set a small payment for the query

      const result = await query.execute(client);
      const isCreator = result.getBool(0);
      
      console.log('Contract query result:', {
        contractId: this.contractId.toString(),
        accountId,
        evmAddress,
        isCreator
      });
      
      return isCreator;
    } catch (error) {
      console.error("Error checking creator status:", error);
      return false;
    } finally {
      client.close();
    }
  }

  // Get registration fee
  async getRegistrationFee(): Promise<number> {
    const client = this.getClient();
    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction("getRegistrationFee")
        .setQueryPayment(new Hbar(1)); // Set a small payment for the query

      const result = await query.execute(client);
      const fee = result.getUint256(0);
      
      // Convert from smallest unit (8 decimals) to tokens
      return Number(fee) / Math.pow(10, 8);
    } catch (error) {
      console.error("Error getting registration fee:", error);
      return 100; // Default fee
    } finally {
      client.close();
    }
  }

  // Register as creator (requires user's private key and account setup)
  // NOTE: This method is deprecated - use creator-registration.ts instead
  async registerAsCreator(
    userAccountId: string, 
    userPrivateKey: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const client = this.getClient();
    try {
      // Set up client with user credentials
      client.setOperator(
        AccountId.fromString(userAccountId),
        PrivateKey.fromStringECDSA(userPrivateKey)
      );

      // First, associate the token if not already associated
      try {
        const associateTransaction = new TokenAssociateTransaction()
          .setAccountId(userAccountId)
          .setTokenIds([this.platformTokenId]);

        await associateTransaction.execute(client);
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

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

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
    } finally {
      client.close();
    }
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