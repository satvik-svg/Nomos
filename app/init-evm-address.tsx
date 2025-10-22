'use client';

import { useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';

/**
 * Component to initialize EVM address from environment variable
 * This runs once when the app loads to set up the EVM address
 */
export default function InitEvmAddress() {
  const { accountId, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected && accountId) {
      // Check if EVM address is already set
      const existing = localStorage.getItem(`evm_address_${accountId}`);
      
      if (!existing) {
        // Try to get from environment variable
        const envEvmAddress = process.env.NEXT_PUBLIC_EVM_ADDRESS;
        
        if (envEvmAddress) {
          console.log('Initializing EVM address from environment:', envEvmAddress);
          localStorage.setItem(`evm_address_${accountId}`, envEvmAddress);
        } else {
          console.warn('No EVM address found. Please set NEXT_PUBLIC_EVM_ADDRESS in .env or set manually in settings.');
        }
      } else {
        console.log('EVM address already set:', existing);
      }
    }
  }, [isConnected, accountId]);

  return null; // This component doesn't render anything
}
