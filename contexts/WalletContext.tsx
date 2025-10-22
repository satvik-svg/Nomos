'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { hederaWalletService, WalletConnectionState } from '@/lib/hedera-wallet-connect';
import { AuthService, CreatorService } from '@/lib/supabase';
import { User } from '@/types';

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
  error: string | null;
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
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet service on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        await hederaWalletService.init();
        
        // Check if already connected
        const currentState = hederaWalletService.getConnectionState();
        setConnectionState(currentState);
        
        if (currentState.isConnected && currentState.accountId) {
          await loadUserData(currentState.accountId);
        }
        
        // Listen for connection changes
        hederaWalletService.onConnectionChange((newState) => {
          setConnectionState(newState);
          if (newState.isConnected && newState.accountId) {
            loadUserData(newState.accountId);
          } else {
            setUser(null);
            setIsCreator(false);
          }
        });
      } catch (err) {
        console.error('Failed to initialize wallet service:', err);
        setError('Failed to initialize wallet connection');
      }
    };

    initializeWallet();
  }, []);

  const loadUserData = async (accountId: string) => {
    try {
      console.log('Loading user data for account:', accountId);
      setIsLoading(true);
      setError(null);
      
      // Authenticate user (find existing or create new)
      const userData = await AuthService.authenticateUser(accountId);
      
      if (!userData) {
        throw new Error('Failed to authenticate user');
      }
      
      console.log('User data loaded:', userData);
      setUser(userData);
      
      // Check creator status from smart contract
      console.log('Checking creator status from smart contract...');
      const evmAddress = connectionState.evmAddress || undefined;
      const creatorStatus = await CreatorService.checkCreatorStatus(accountId, evmAddress);
      console.log('Creator status updated:', creatorStatus);
      setIsCreator(creatorStatus);
      
    } catch (err) {
      console.error('Failed to load user data:', err);
      setError('Failed to load user data. Please try again.');
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
        await loadUserData(newState.accountId);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hederaWalletService.disconnectWallet();
      setConnectionState({
        isConnected: false,
        accountId: null,
        network: null,
        topic: null,
      });
      setUser(null);
      setIsCreator(false);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError('Failed to disconnect wallet');
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
      await loadUserData(connectionState.accountId);
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