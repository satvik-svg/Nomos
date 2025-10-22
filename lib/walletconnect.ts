import { AccountId } from '@hashgraph/sdk';

export interface WalletConnectionState {
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
  topic: string | null;
}

// Extend Window interface to include hashconnect (HashPack's new API)
declare global {
  interface Window {
    hashconnect?: {
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
    // Legacy hashpack support
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
      // Wait a bit for extensions to load
      setTimeout(() => {
        this.checkExistingConnection();
      }, 1000);
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
    while (!this.getHashPackInstance() && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    if (!this.getHashPackInstance()) {
      console.warn('HashPack not detected. Please install HashPack wallet extension.');
    } else {
      console.log('HashPack detected successfully');
    }
  }

  private getHashPackInstance() {
    // Try new hashconnect API first, then fall back to legacy hashpack
    return window.hashconnect || window.hashpack;
  }

  private checkExistingConnection(): void {
    const hashpack = this.getHashPackInstance();
    if (hashpack) {
      try {
        const state = hashpack.getConnectionState();
        if (state && state.accountIds && state.accountIds.length > 0) {
          this.connectionState = {
            isConnected: true,
            accountId: state.accountIds[0],
            network: state.network || 'testnet',
            topic: state.topic || null,
          };
          console.log('Existing HashPack connection found:', this.connectionState);
        }
      } catch (error) {
        console.log('No existing HashPack connection found');
      }
    }
  }

  async connectWallet(): Promise<WalletConnectionState> {
    try {
      const hashpack = this.getHashPackInstance();
      
      if (!hashpack) {
        throw new Error('HashPack wallet not found. Please install HashPack extension and refresh the page.');
      }

      console.log('Attempting to connect to HashPack...');
      const result = await hashpack.connectToLocalWallet();
      console.log('HashPack connection result:', result);
      
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
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('Connection rejected by user. Please try again and approve the connection in HashPack.');
        } else if (error.message.includes('not found')) {
          throw new Error('HashPack wallet not found. Please install HashPack extension and refresh the page.');
        }
      }
      
      throw new Error('Failed to connect to HashPack. Please make sure HashPack is installed and unlocked.');
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      const hashpack = this.getHashPackInstance();
      if (hashpack) {
        await hashpack.disconnect();
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
      const hashpack = this.getHashPackInstance();
      
      if (!hashpack) {
        throw new Error('HashPack wallet not found');
      }

      if (!this.connectionState.topic) {
        throw new Error('No active wallet connection');
      }

      const response = await hashpack.sendTransaction(
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
    return typeof window !== 'undefined' && !!this.getHashPackInstance();
  }
}

// Singleton instance
export const hashPackService = new HashPackService();