'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { hederaWalletService, WalletConnectionState } from '@/lib/hedera-wallet-connect';
import { AuthService, UserService } from '@/lib/supabase';
import { User } from '@/types';
import { parseWalletError, parseError, logError, AppError } from '@/lib/error-handling';

interface WalletContextType {
  // Connection state
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
  evmAddress: string | null;
  isLoading: boolean;

  // User data
  user: User | null;
  isCreator: boolean;

  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshUserData: () => Promise<void>;

  // Error handling
  error: AppError | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    accountId: null,
    network: null,
    topic: null,
    evmAddress: null,
  });

  const [user, setUser] = useState<User | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  // Initialize wallet service on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        await hederaWalletService.init();

        // Check if already connected
        const currentState = hederaWalletService.getConnectionState();
        setConnectionState(currentState);

        if (currentState.isConnected && currentState.accountId) {
          await loadUserData(currentState.accountId, currentState.evmAddress || undefined);
        }

        // Listen for connection changes
        hederaWalletService.onConnectionChange(async (newState) => {
          console.log('Connection state changed:', newState);
          setConnectionState(newState);
          if (newState.isConnected && newState.accountId) {
            await loadUserData(newState.accountId, newState.evmAddress || undefined);
          } else {
            setUser(null);
            setIsCreator(false);
            setIsLoading(false);
          }
        });
      } catch (err) {
        const appError = parseWalletError(err);
        logError(appError, 'WalletContext.initializeWallet');
        setError(appError);
      }
    };

    initializeWallet();
  }, []);

  const loadUserData = async (accountId: string, evmAddress?: string) => {
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Loading user data timed out');
      setIsLoading(false);
      const timeoutError = parseError(
        new Error('Loading user data timed out'),
        'WalletContext.loadUserData'
      );
      setError(timeoutError);
    }, 30000); // 30 second timeout

    try {
      console.log('Loading user data for account:', accountId);
      console.log('EVM Address:', evmAddress);
      setIsLoading(true);
      setError(null);

      // Authenticate user (find existing or create new)
      const userData = await AuthService.authenticateUser(accountId, evmAddress);

      if (!userData) {
        throw new Error('Failed to authenticate user');
      }

      console.log('User data loaded:', userData);
      setUser(userData);

      // Get EVM address with fallback methods
      let effectiveEvmAddress = evmAddress || userData.evm_address || undefined;

      // If no EVM address, try to fetch from Mirror Node
      if (!effectiveEvmAddress) {
        console.log('No EVM address found, fetching from Mirror Node...');
        const { getEvmAddress } = await import('@/lib/get-evm-address');
        const network = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') as 'testnet' | 'mainnet';
        effectiveEvmAddress = await getEvmAddress(accountId, network) || undefined;

        // Update database with the fetched EVM address
        if (effectiveEvmAddress && userData.evm_address !== effectiveEvmAddress) {
          console.log('Updating database with EVM address:', effectiveEvmAddress);
          await UserService.updateUser(userData.id, {
            evm_address: effectiveEvmAddress
          });
        }
      }

      console.log('Effective EVM Address:', effectiveEvmAddress);

      // Check creator status using comprehensive verification
      console.log('Verifying creator status...');
      const { verifyCreatorStatus } = await import('@/lib/creator-status-verification');
      const statusResult = await verifyCreatorStatus({
        accountId,
        evmAddress: effectiveEvmAddress,
        useCache: true,
      });
      console.log('Creator status result:', statusResult);

      // Warn if there's a discrepancy
      if (statusResult.hasDiscrepancy) {
        console.warn('⚠️ Creator status discrepancy detected!');
        console.warn('  On-chain:', statusResult.onChainStatus);
        console.warn('  Database:', statusResult.databaseStatus);
        console.warn('  Using:', statusResult.isCreator, 'from', statusResult.source);
      }

      setIsCreator(statusResult.isCreator);

      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      const appError = parseError(err, 'WalletContext.loadUserData');
      logError(appError, 'WalletContext.loadUserData');
      setError(appError);
      // Reset user state on error
      setUser(null);
      setIsCreator(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newState = await hederaWalletService.connectWallet();
      setConnectionState(newState);

      if (newState.accountId) {
        await loadUserData(newState.accountId, newState.evmAddress || undefined);
      }
    } catch (err) {
      const appError = parseWalletError(err);
      logError(appError, 'WalletContext.connectWallet');
      setError(appError);
      // Reset connection state on error
      setConnectionState({
        isConnected: false,
        accountId: null,
        network: null,
        topic: null,
        evmAddress: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear creator status cache for current account
      if (connectionState.accountId) {
        const { clearCreatorStatusCache } = await import('@/lib/creator-status-cache');
        clearCreatorStatusCache(connectionState.accountId);
      }

      await hederaWalletService.disconnectWallet();
      setConnectionState({
        isConnected: false,
        accountId: null,
        network: null,
        topic: null,
        evmAddress: null,
      });
      setUser(null);
      setIsCreator(false);
    } catch (err) {
      const appError = parseError(err, 'WalletContext.disconnectWallet');
      logError(appError, 'WalletContext.disconnectWallet');
      setError(appError);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUserData = async () => {
    console.log('Refreshing user data...');
    if (connectionState.accountId) {
      // Clear creator status cache before refreshing
      if (typeof window !== 'undefined') {
        const { clearCreatorStatusCache } = await import('@/lib/creator-status-cache');
        clearCreatorStatusCache(connectionState.accountId);
        console.log('Creator status cache cleared');
      }

      await loadUserData(connectionState.accountId, connectionState.evmAddress || undefined);
      console.log('User data refresh complete');
    } else {
      console.warn('No account ID available for refresh');
    }
  };

  const value: WalletContextType = {
    // Connection state
    isConnected: connectionState.isConnected,
    accountId: connectionState.accountId,
    network: connectionState.network,
    evmAddress: connectionState.evmAddress,
    isLoading,

    // User data
    user,
    isCreator,

    // Actions
    connectWallet,
    disconnectWallet,
    refreshUserData,

    // Error handling
    error,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}