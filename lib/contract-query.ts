/**
 * Contract Query Utilities
 * 
 * This module provides utilities to query the Creator Registry smart contract
 * on the Hedera blockchain.
 */

import { ethers } from 'ethers';

const CREATOR_REGISTRY_ABI = [
  "function isCreator(address account) view returns (bool)"
];

/**
 * Check if an address is registered as a creator on-chain
 */
export async function checkCreatorStatusOnChain(evmAddress: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_HEDERA_JSON_RPC_RELAY!
    );

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CREATOR_REGISTRY_ADDRESS!,
      CREATOR_REGISTRY_ABI,
      provider
    );

    const isCreator = await contract.isCreator(evmAddress);
    return isCreator;
  } catch (error) {
    console.error('Error checking creator status on-chain:', error);
    throw error;
  }
}

/**
 * Get creator registry contract instance
 */
export function getCreatorRegistryContract() {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_HEDERA_JSON_RPC_RELAY!
  );

  return new ethers.Contract(
    process.env.NEXT_PUBLIC_CREATOR_REGISTRY_ADDRESS!,
    CREATOR_REGISTRY_ABI,
    provider
  );
}
