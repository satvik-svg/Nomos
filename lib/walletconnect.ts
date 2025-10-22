import { AccountId } from '@hashgraph/sdk';

export interface WalletConnectionState {
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
  topic: string | null;
}

// Extend Window interface to include hashpack
declare global {
  interface Window {
    hashpack?: {
      connectToLocalWallet: () => Promise<{
        accountIds: string[];
        network: string;
        topic: string;
      }>;
      disconnect: () => Promise<void>;
      sendTransaction: (topic: string, transaction: {
        byteArray: Uint8Array;
        metadata: {
          accountToSign: string;
          returnTransaction: boolean;
        };
      }) => Promise<{
        success: boolean;
        response?: unknown;
        error?: string;
      }>;
      getConnectionState: () => {
        accountIds?: string[];
        network?: string;
        topic?: string;
      } | null;
    };
  }
}

export class HashPackService {
  private connectionState: WalletConnectionState = {
    isConnected: false,
    accountId: null,
    network: null,
    topic: null,
  };

  private connectionChangeCallbacks: ((state: WalletConnectionState) => void)[] = [];

  constructor() {
    // Check for existing connection on initialization
    if (typeof window !== 'undefined') {
      this.checkExistingConnection();
    }
  }

  async init(): Promise<void> {
    // HashPack doesn't require explicit initialization
    // Just check if it's available
    if (typeof window === 'undefined') {
      throw new Error('HashPack can only be used in browser environment');
    }

    // Wait a bit for HashPack to load if it's not immediately available
    let attempts = 0;
    while (!window.hashpack && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.hashpack) {
      console.warn('HashPack not detected. Please install HashPack wallet extension.');
    }
  }

  private checkExistingConnection(): void {
    if (window.hashpack) {
      const state = window.hashpack.getConnectionState();
      if (state && state.accountIds && state.accountIds.length > 0) {
        this.connectionState = {
          isConnected: true,
          accountId: state.accountIds[0],
          network: state.network || 'testnet',
          topic: state.topic || null,
        };
      }
    }
  }

  async connectWallet(): Promise<WalletConnectionState> {
    try {
      if (!window.hashpack) {
        throw new Error('HashPack wallet not found. Please install HashPack extension.');
      }

      const result = await window.hashpack.connectToLocalWallet();
      
      this.connectionState = {
        isConnected: true,
        accountId: result.accountIds[0] || null,
        network: result.network || 'testnet',
        topic: result.topic || null,
      };

      // Notify listeners
      this.connectionChangeCallbacks.forEach(callback => callback(this.connectionState));

      return this.connectionState;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      if (window.hashpack) {
        await window.hashpack.disconnect();
      }

      this.connectionState = {
        isConnected: false,
        accountId: null,
        network: null,
        topic: null,
      };

      // Notify listeners
      this.connectionChangeCallbacks.forEach(callback => callback(this.connectionState));
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  getConnectionState(): WalletConnectionState {
    return { ...this.connectionState };
  }

  onConnectionChange(callback: (state: WalletConnectionState) => void): void {
    this.connectionChangeCallbacks.push(callback);
  }

  async sendTransaction(transactionBytes: Uint8Array, accountId: string): Promise<{
    success: boolean;
    response?: unknown;
    error?: string;
  }> {
    try {
      if (!window.hashpack) {
        throw new Error('HashPack wallet not found');
      }

      if (!this.connectionState.topic) {
        throw new Error('No active wallet connection');
      }

      const response = await window.hashpack.sendTransaction(
        this.connectionState.topic,
        {
          byteArray: transactionBytes,
          metadata: {
            accountToSign: accountId,
            returnTransaction: false,
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  isValidAccountId(accountId: string): boolean {
    try {
      AccountId.fromString(accountId);
      return true;
    } catch {
      return false;
    }
  }

  isHashPackAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.hashpack;
  }
}

// Singleton instance
export const hashPackService = new HashPackService();