/**
 * Utility to get EVM address for a Hedera account
 * 
 * The EVM address can be obtained in several ways:
 * 1. From the wallet session metadata (if provided)
 * 2. From Hedera Mirror Node API
 * 3. Derived from the account's ECDSA public key
 */

import { AccountId } from '@hashgraph/sdk';

/**
 * Get EVM address from Hedera Mirror Node
 * This is the most reliable method as it queries the actual account data
 */
export async function getEvmAddressFromMirrorNode(
  accountId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string | null> {
  try {
    const mirrorNodeUrl = network === 'mainnet'
      ? 'https://mainnet-public.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com';

    const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${accountId}`);
    
    if (!response.ok) {
      console.error('Mirror node request failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    // The EVM address is in the response
    if (data.evm_address) {
      console.log('EVM address from mirror node:', data.evm_address);
      return data.evm_address;
    }

    console.warn('No EVM address found in mirror node response');
    return null;
  } catch (error) {
    console.error('Failed to get EVM address from mirror node:', error);
    return null;
  }
}

/**
 * Get EVM address with fallback methods
 * Tries multiple methods in order of reliability
 */
export async function getEvmAddress(
  accountId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<string | null> {
  // Method 1: Check localStorage cache
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`evm_address_${accountId}`);
    if (cached && cached.startsWith('0x') && cached.length === 42) {
      console.log('Using cached EVM address:', cached);
      return cached;
    }
  }

  // Method 2: Get from Mirror Node (most reliable)
  const mirrorNodeAddress = await getEvmAddressFromMirrorNode(accountId, network);
  if (mirrorNodeAddress) {
    // Cache it for future use
    if (typeof window !== 'undefined') {
      localStorage.setItem(`evm_address_${accountId}`, mirrorNodeAddress);
    }
    return mirrorNodeAddress;
  }

  // Method 3: Calculate from account number (least reliable, only for long-form addresses)
  // This is a fallback and may not be accurate for all accounts
  console.warn('Using calculated EVM address as fallback - may not be accurate');
  return calculateEvmAddressFromAccountId(accountId);
}

/**
 * Calculate EVM address from Hedera account ID
 * Note: This only works for accounts with long-form EVM addresses
 * For accounts created with ECDSA keys, use Mirror Node instead
 */
function calculateEvmAddressFromAccountId(accountId: string): string {
  try {
    const parts = accountId.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid account ID format');
    }

    const [shard, realm, num] = parts.map(p => parseInt(p));
    
    // Convert to hex and pad to 40 characters (20 bytes)
    // Format: shard (4 bytes) + realm (8 bytes) + num (8 bytes)
    const shardHex = shard.toString(16).padStart(8, '0');
    const realmHex = realm.toString(16).padStart(16, '0');
    const numHex = num.toString(16).padStart(16, '0');
    
    return `0x${shardHex}${realmHex}${numHex}`.slice(0, 42);
  } catch (error) {
    console.error('Failed to calculate EVM address:', error);
    // Return a zero address as ultimate fallback
    return '0x0000000000000000000000000000000000000000';
  }
}

/**
 * Validate EVM address format
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
