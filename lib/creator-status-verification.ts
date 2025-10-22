/**
 * Creator Status Verification Utilities
 * 
 * This module provides utilities to verify creator status and handle discrepancies
 * between on-chain (blockchain) and database status.
 * 
 * Note: On-chain verification already exists in lib/contract.ts
 * This module focuses on discrepancy detection and reconciliation.
 * 
 * Requirements: 10.1, 10.5
 */

import { getCreatorRegistryService } from './contract';
import { CreatorService, UserService } from './supabase';
import { getCreatorStatusCache, setCreatorStatusCache, clearCreatorStatusCache } from './creator-status-cache';

export interface CreatorStatusResult {
  isCreator: boolean;
  source: 'blockchain' | 'database' | 'cache' | 'unknown';
  onChainStatus?: boolean;
  databaseStatus?: boolean;
  hasDiscrepancy: boolean;
  error?: string;
}

export interface CreatorStatusCheckOptions {
  accountId: string;
  evmAddress?: string;
  useCache?: boolean;
  forceRefresh?: boolean;
}

/**
 * Comprehensive creator status check that verifies both on-chain and database status
 * Prioritizes blockchain as source of truth per Requirement 10.5
 */
export async function verifyCreatorStatus(
  options: CreatorStatusCheckOptions
): Promise<CreatorStatusResult> {
  const { accountId, evmAddress, useCache = true, forceRefresh = false } = options;

  console.log('=== Creator Status Verification ===');
  console.log('Account ID:', accountId);
  console.log('EVM Address:', evmAddress);
  console.log('Use Cache:', useCache);
  console.log('Force Refresh:', forceRefresh);

  // Check cache first if enabled and not forcing refresh
  if (useCache && !forceRefresh && evmAddress) {
    const cachedStatus = getCreatorStatusCache(accountId, evmAddress);
    if (cachedStatus !== null) {
      console.log('✓ Using cached creator status:', cachedStatus);
      return {
        isCreator: cachedStatus,
        source: 'cache',
        hasDiscrepancy: false,
      };
    }
  }

  let onChainStatus: boolean | undefined;
  let databaseStatus: boolean | undefined;
  let error: string | undefined;

  // 1. Check on-chain status (source of truth)
  try {
    console.log('Checking on-chain creator status...');
    
    // Use ethers.js for more reliable contract queries
    if (evmAddress) {
      const { ethers } = await import('ethers');
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_HEDERA_JSON_RPC_RELAY || 'https://testnet.hashio.io/api'
      );
      const contractAddress = process.env.NEXT_PUBLIC_CREATOR_REGISTRY_ADDRESS;
      
      if (contractAddress) {
        const abi = ['function isCreator(address account) view returns (bool)'];
        const contract = new ethers.Contract(contractAddress, abi, provider);
        onChainStatus = await contract.isCreator(evmAddress);
        console.log('✓ On-chain status (ethers):', onChainStatus);
      } else {
        throw new Error('Contract address not configured');
      }
    } else {
      // Fallback to Hedera SDK if no EVM address
      const contractService = getCreatorRegistryService();
      onChainStatus = await contractService.isCreator(accountId, evmAddress);
      console.log('✓ On-chain status (SDK):', onChainStatus);
    }
  } catch (err) {
    console.error('✗ Failed to check on-chain status:', err);
    error = err instanceof Error ? err.message : 'Failed to check blockchain status';
  }

  // 2. Check database status
  try {
    console.log('Checking database creator status...');
    databaseStatus = await CreatorService.checkCreatorStatus(accountId, evmAddress);
    console.log('✓ Database status:', databaseStatus);
  } catch (err) {
    console.error('✗ Failed to check database status:', err);
    if (!error) {
      error = err instanceof Error ? err.message : 'Failed to check database status';
    }
  }

  // 3. Determine final status and check for discrepancies
  const hasDiscrepancy = 
    onChainStatus !== undefined && 
    databaseStatus !== undefined && 
    onChainStatus !== databaseStatus;

  if (hasDiscrepancy) {
    console.warn('⚠️ DISCREPANCY DETECTED:');
    console.warn('  On-chain status:', onChainStatus);
    console.warn('  Database status:', databaseStatus);
    console.warn('  Using on-chain status as source of truth');
  }

  // Prioritize on-chain status as source of truth (Requirement 10.5)
  let finalStatus: boolean;
  let source: CreatorStatusResult['source'];

  if (onChainStatus !== undefined) {
    finalStatus = onChainStatus;
    source = 'blockchain';
  } else if (databaseStatus !== undefined) {
    finalStatus = databaseStatus;
    source = 'database';
    console.warn('⚠️ Using database status as fallback (blockchain check failed)');
  } else {
    finalStatus = false;
    source = 'unknown';
    console.error('✗ Both blockchain and database checks failed');
  }

  // Cache the result if we have an EVM address
  if (evmAddress && onChainStatus !== undefined) {
    setCreatorStatusCache(accountId, evmAddress, onChainStatus);
  }

  const result: CreatorStatusResult = {
    isCreator: finalStatus,
    source,
    onChainStatus,
    databaseStatus,
    hasDiscrepancy,
    error,
  };

  console.log('=== Verification Result ===');
  console.log('Final Status:', finalStatus);
  console.log('Source:', source);
  console.log('Has Discrepancy:', hasDiscrepancy);
  console.log('============================');

  return result;
}

/**
 * Check only on-chain creator status
 * Useful when you specifically need blockchain verification
 */
export async function checkOnChainCreatorStatus(
  accountId: string,
  evmAddress?: string
): Promise<boolean> {
  try {
    console.log('Checking on-chain creator status for:', accountId);
    const contractService = getCreatorRegistryService();
    const isCreator = await contractService.isCreator(accountId, evmAddress);
    console.log('On-chain creator status:', isCreator);
    return isCreator;
  } catch (error) {
    console.error('Failed to check on-chain creator status:', error);
    throw new Error(
      `Failed to verify creator status on blockchain: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Check only database creator status
 * Useful for quick checks when blockchain verification is not required
 */
export async function checkDatabaseCreatorStatus(
  accountId: string
): Promise<boolean> {
  try {
    console.log('Checking database creator status for:', accountId);
    const isCreator = await CreatorService.checkCreatorStatus(accountId);
    console.log('Database creator status:', isCreator);
    return isCreator;
  } catch (error) {
    console.error('Failed to check database creator status:', error);
    throw new Error(
      `Failed to verify creator status in database: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Reconcile discrepancies between on-chain and database status
 * Updates the database to match the blockchain (source of truth)
 */
export async function reconcileCreatorStatus(
  accountId: string,
  evmAddress?: string
): Promise<{
  success: boolean;
  wasDiscrepancy: boolean;
  updatedStatus?: boolean;
  error?: string;
}> {
  try {
    console.log('=== Reconciling Creator Status ===');
    console.log('Account ID:', accountId);

    // Get both statuses
    const verification = await verifyCreatorStatus({
      accountId,
      evmAddress,
      useCache: false,
      forceRefresh: true,
    });

    // If no discrepancy, nothing to do
    if (!verification.hasDiscrepancy) {
      console.log('✓ No discrepancy found, statuses are in sync');
      return {
        success: true,
        wasDiscrepancy: false,
      };
    }

    // If we don't have on-chain status, we can't reconcile
    if (verification.onChainStatus === undefined) {
      console.error('✗ Cannot reconcile: on-chain status unavailable');
      return {
        success: false,
        wasDiscrepancy: true,
        error: 'Cannot reconcile without on-chain status',
      };
    }

    console.log('⚠️ Discrepancy detected, updating database to match blockchain');
    console.log('  Blockchain status:', verification.onChainStatus);
    console.log('  Database status:', verification.databaseStatus);

    // Find the user in database
    const user = await UserService.findByHederaAccountId(accountId);
    if (!user) {
      console.error('✗ User not found in database');
      return {
        success: false,
        wasDiscrepancy: true,
        error: 'User not found in database',
      };
    }

    // Update database to match blockchain
    await UserService.updateUser(user.id, {
      // @ts-ignore - is_creator field exists but not in type definition
      is_creator: verification.onChainStatus,
    });

    console.log('✓ Database updated successfully');
    console.log('  New status:', verification.onChainStatus);

    // Clear cache to force fresh check next time
    if (evmAddress) {
      const { clearCreatorStatusCache } = await import('./creator-status-cache');
      clearCreatorStatusCache(accountId);
    }

    return {
      success: true,
      wasDiscrepancy: true,
      updatedStatus: verification.onChainStatus,
    };
  } catch (error) {
    console.error('✗ Failed to reconcile creator status:', error);
    return {
      success: false,
      wasDiscrepancy: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch verify creator status for multiple accounts
 * Useful for syncing or bulk operations
 */
export async function batchVerifyCreatorStatus(
  accounts: Array<{ accountId: string; evmAddress?: string }>
): Promise<Map<string, CreatorStatusResult>> {
  console.log(`=== Batch Verifying ${accounts.length} Accounts ===`);
  
  const results = new Map<string, CreatorStatusResult>();

  // Process in parallel with a reasonable concurrency limit
  const BATCH_SIZE = 5;
  for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
    const batch = accounts.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (account) => {
        const result = await verifyCreatorStatus({
          accountId: account.accountId,
          evmAddress: account.evmAddress,
          useCache: true,
        });
        return { accountId: account.accountId, result };
      })
    );

    batchResults.forEach(({ accountId, result }) => {
      results.set(accountId, result);
    });

    console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(accounts.length / BATCH_SIZE)}`);
  }

  console.log('=== Batch Verification Complete ===');
  return results;
}

/**
 * Get a summary of creator status verification
 * Useful for debugging and monitoring
 */
export function getStatusSummary(result: CreatorStatusResult): string {
  const lines = [
    `Creator Status: ${result.isCreator ? 'YES' : 'NO'}`,
    `Source: ${result.source}`,
  ];

  if (result.onChainStatus !== undefined) {
    lines.push(`On-chain: ${result.onChainStatus ? 'YES' : 'NO'}`);
  }

  if (result.databaseStatus !== undefined) {
    lines.push(`Database: ${result.databaseStatus ? 'YES' : 'NO'}`);
  }

  if (result.hasDiscrepancy) {
    lines.push('⚠️ DISCREPANCY DETECTED - Using blockchain as source of truth');
  }

  if (result.error) {
    lines.push(`Error: ${result.error}`);
  }

  return lines.join('\n');
}
