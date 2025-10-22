'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { hashPackService, WalletConnectionState } from '@/lib/walletconnect';
import { AuthService, CreatorService } from '@/lib/supabase';
import { User } from '@/types';

interface WalletContextType {
  // Connection state
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
  isLoading: boolean;
  
  // User data
  user: User | null;
  isCreator: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  
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

  // Initialize HashPack on mount
  useEffect(() => {
    const initializeHashPack = async () => {
      try {
        await hashPackService.init();
        
        // Check if already connected
        const currentState = hashPackService.getConnectionState();
        setConnectionState(currentState);
        
        if (currentState.isConnected && currentState.accountId) {
          await loadUserData(currentState.accountId);
        }
        
        // Listen for connection changes
        hashPackService.onConnectionChange((newState) => {
          setConnectionState(newState);
          if (newState.isConnected && newState.accountId) {
            loadUserData(newState.accountId);
          } else {
            setUser(null);
            setIsCreator(false);
          }
        });
      } catch (err) {
        console.error('Failed to initialize HashPack:', err);
        setError('Failed to initialize wallet connection');
      }
    };

    initializeHashPack();
  }, []);

  const loadUserData = async (accountId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Authenticate user (find existing or create new)
      const userData = await AuthService.authenticateUser(accountId);
      
      if (!userData) {
        throw new Error('Failed to authenticate user');
      }
      
      setUser(userData);
      
      // Check creator status from smart contract
      const creatorStatus = await CreatorService.checkCreatorStatus(accountId);
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
      
      const newState = await hashPackService.connectWallet();
      setConnectionState(newState);
      
      if (newState.accountId) {
        await loadUserData(newState.accountId);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError('Failed to connect wallet. Please make sure HashPack is installed and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hashPackService.disconnectWallet();
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

  const value: WalletContextType = {
    // Connection state
    isConnected: connectionState.isConnected,
    accountId: connectionState.accountId,
    network: connectionState.network,
    isLoading,
    
    // User data
    user,
    isCreator,
    
    // Actions
    connectWallet,
    disconnectWallet,
    
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