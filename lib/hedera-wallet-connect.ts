import {
  HederaSessionEvent,
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
} from '@hashgraph/hedera-wallet-connect/dist/lib';
import { LedgerId } from '@hashgraph/sdk';

export interface WalletConnectionState {
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
  topic: string | null;
  evmAddress: string | null;
}

export class HederaWalletService {
  private dAppConnector: DAppConnector | null = null;
  private connectionState: WalletConnectionState = {
    isConnected: false,
    accountId: null,
    network: null,
    topic: null,
    evmAddress: null,
  };
  private connectionChangeCallbacks: ((state: WalletConnectionState) => void)[] = [];

  constructor() {
    // Initialize in browser environment only
    if (typeof window !== 'undefined') {
      this.initializeDAppConnector();
    }
  }

  private async initializeDAppConnector() {
    try {
      // Get project ID from environment or use a default for development
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id';
      
      const metadata = {
        name: 'Hedera Content Platform',
        description: 'Decentralized content monetization platform built on Hedera Hashgraph',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
        icons: ['https://avatars.githubusercontent.com/u/31002956'], // Hedera logo
      };

      // Determine network based on environment
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
      const ledgerId = network === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;
      const chainId = network === 'mainnet' ? HederaChainId.Mainnet : HederaChainId.Testnet;

      this.dAppConnector = new DAppConnector(
        metadata,
        ledgerId,
        projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [chainId]
      );

      // Initialize the connector
      await this.dAppConnector.init({ logger: 'error' });

      // Set up event listeners (if the method exists)
      if (typeof this.dAppConnector.onSessionEvent === 'function') {
        this.setupEventListeners();
      } else {
        console.warn('onSessionEvent method not available, using alternative approach');
      }

      // Check for existing sessions
      await this.checkExistingSession();

      console.log('Hedera WalletConnect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hedera WalletConnect:', error);
    }
  }

  private setupEventListeners() {
    if (!this.dAppConnector) return;

    try {
      // Listen for session events
      this.dAppConnector.onSessionEvent((event) => {
        console.log('Session event:', event);
        
        switch (event.name) {
          case HederaSessionEvent.AccountsChanged:
            // Call async method without blocking
            this.handleAccountsChanged(event.data).catch(error => {
              console.error('Error handling accounts changed:', error);
            });
            break;
          case HederaSessionEvent.ChainChanged:
            this.handleChainChanged(event.data);
            break;
        }
      });
    } catch (error) {
      console.warn('Failed to set up session event listeners:', error);
    }
  }

  private async handleAccountsChanged(accounts: string[]) {
    console.log('Accounts changed:', accounts);
    
    if (accounts && accounts.length > 0) {
      const accountId = accounts[0];
      
      // Try to get EVM address from the session or derive it
      let evmAddress: string | null = null;
      try {
        evmAddress = await this.getEvmAddressForAccount(accountId);
      } catch (error) {
        console.warn('Could not get EVM address:', error);
      }
      
      this.connectionState = {
        ...this.connectionState,
        accountId,
        isConnected: true,
        evmAddress,
      };
    } else {
      this.connectionState = {
        isConnected: false,
        accountId: null,
        network: null,
        topic: null,
        evmAddress: null,
      };
    }

    this.notifyConnectionChange();
  }

  private async getEvmAddressForAccount(accountId: string): Promise<string | null> {
    try {
      // Try to get from localStorage first (cached from previous connection)
      const cached = localStorage.getItem(`evm_address_${accountId}`);
      if (cached) {
        console.log('Using cached EVM address:', cached);
        return cached;
      }

      // Try to get from wallet session
      if (this.dAppConnector) {
        const sessions = this.dAppConnector.walletConnectClient?.session.getAll();
        if (sessions && sessions.length > 0) {
          const session = sessions[0];
          // Some wallets include the EVM address in the session metadata
          const metadata = session.peer?.metadata;
          if (metadata?.evmAddress) {
            const evmAddress = metadata.evmAddress as string;
            localStorage.setItem(`evm_address_${accountId}`, evmAddress);
            return evmAddress;
          }
        }
      }

      // If we can't get it from the wallet, return null
      // The user will need to set it manually or we'll use the fallback
      console.warn('Could not retrieve EVM address from wallet. Using fallback method.');
      return null;
    } catch (error) {
      console.error('Error getting EVM address:', error);
      return null;
    }
  }

  private handleChainChanged(chainInfo: unknown) {
    console.log('Chain changed:', chainInfo);
    
    if (chainInfo && chainInfo.chainId) {
      const network = chainInfo.chainId === HederaChainId.Mainnet ? 'mainnet' : 'testnet';
      this.connectionState = {
        ...this.connectionState,
        network,
      };
      
      this.notifyConnectionChange();
    }
  }

  private async checkExistingSession() {
    if (!this.dAppConnector) return;

    try {
      const sessions = this.dAppConnector.walletConnectClient?.session.getAll();
      
      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        const accounts = Object.values(session.namespaces)
          .flatMap((namespace: unknown) => (namespace as Record<string, unknown>).accounts as string[])
          .map((account: string) => account.split(':').pop())
          .filter(Boolean);

        if (accounts.length > 0) {
          const accountId = accounts[0];
          
          // Try to get EVM address
          let evmAddress: string | null = null;
          try {
            evmAddress = await this.getEvmAddressForAccount(accountId);
          } catch (error) {
            console.warn('Could not get EVM address:', error);
          }
          
          this.connectionState = {
            isConnected: true,
            accountId,
            network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
            topic: session.topic,
            evmAddress,
          };

          console.log('Existing session found:', this.connectionState);
          this.notifyConnectionChange();
        }
      }
    } catch (error) {
      console.log('No existing session found');
    }
  }

  private notifyConnectionChange() {
    this.connectionChangeCallbacks.forEach(callback => {
      try {
        callback(this.connectionState);
      } catch (error) {
        console.error('Error in connection change callback:', error);
      }
    });
  }

  async init(): Promise<void> {
    // Initialization is handled in constructor for browser environment
    if (!this.dAppConnector) {
      await this.initializeDAppConnector();
    }
  }

  async connectWallet(): Promise<WalletConnectionState> {
    try {
      if (!this.dAppConnector) {
        throw new Error('DApp connector not initialized. Please refresh the page and try again.');
      }

      console.log('Opening wallet connection modal...');
      
      // Open the WalletConnect modal
      await this.dAppConnector.openModal();

      // Wait for connection to be established
      // The connection state will be updated via event listeners
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout. Please make sure you approve the connection in your wallet.'));
        }, 60000); // 60 second timeout

        let attempts = 0;
        const maxAttempts = 120; // Check every 500ms for 60 seconds

        const checkConnection = () => {
          attempts++;
          
          if (this.connectionState.isConnected) {
            clearTimeout(timeout);
            resolve(this.connectionState);
          } else if (attempts >= maxAttempts) {
            clearTimeout(timeout);
            reject(new Error('Connection timeout. Please try again and make sure to approve the connection in your wallet.'));
          } else {
            setTimeout(checkConnection, 500);
          }
        };

        // Start checking immediately
        checkConnection();
      });

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('Connection rejected by user. Please try again and approve the connection in your wallet.');
        } else if (error.message.includes('No wallet')) {
          throw new Error('No compatible wallet found. Please install HashPack or another Hedera-compatible wallet.');
        }
      }
      
      throw new Error('Failed to connect wallet. Please make sure you have a Hedera-compatible wallet installed.');
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      if (this.dAppConnector) {
        const sessions = this.dAppConnector.walletConnectClient?.session.getAll();
        
        if (sessions && sessions.length > 0) {
          for (const session of sessions) {
            await this.dAppConnector.walletConnectClient?.session.delete(
              session.topic,
              { code: 6000, message: 'User disconnected' }
            );
          }
        }
      }

      this.connectionState = {
        isConnected: false,
        accountId: null,
        network: null,
        topic: null,
        evmAddress: null,
      };

      this.notifyConnectionChange();
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  async sendTransaction(transactionBytes: Uint8Array, accountId: string): Promise<{
    success: boolean;
    response?: unknown;
    error?: string;
  }> {
    try {
      if (!this.dAppConnector) {
        throw new Error('DApp connector not initialized');
      }

      if (!this.connectionState.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Verify the request method exists
      if (typeof this.dAppConnector.request !== 'function') {
        throw new Error('DApp connector request method not available');
      }

      // Convert transaction bytes to base64 string (HashPack expects base64)
      const transactionBase64 = Buffer.from(transactionBytes).toString('base64');

      console.log('Sending transaction:', {
        accountId,
        transactionLength: transactionBytes.length,
        method: HederaJsonRpcMethod.SignAndExecuteTransaction
      });

      // Send transaction using Hedera JSON-RPC method
      const result = await this.dAppConnector.request({
        method: HederaJsonRpcMethod.SignAndExecuteTransaction,
        params: {
          signerAccountId: `hedera:testnet:${accountId}`,
          transactionList: transactionBase64,
        },
      });

      console.log('Transaction result:', result);

      return {
        success: true,
        response: result,
      };

    } catch (error) {
      console.error('Failed to send transaction:', error);
      
      let errorMessage = 'Transaction failed';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (errorMessage.includes('User rejected')) {
          errorMessage = 'Transaction rejected by user';
        } else if (errorMessage.includes('insufficient')) {
          errorMessage = 'Insufficient balance to complete transaction';
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  getConnectionState(): WalletConnectionState {
    return { ...this.connectionState };
  }

  onConnectionChange(callback: (state: WalletConnectionState) => void): void {
    this.connectionChangeCallbacks.push(callback);
  }

  isValidAccountId(accountId: string): boolean {
    // Basic Hedera account ID validation (format: 0.0.xxxxx)
    return /^0\.0\.\d+$/.test(accountId);
  }

  isWalletConnectAvailable(): boolean {
    return !!this.dAppConnector;
  }
}

// Singleton instance
export const hederaWalletService = new HederaWalletService();