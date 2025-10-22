// Simple wallet connection service that works without complex WalletConnect setup
// This is a fallback implementation for development

export interface WalletConnectionState {
  isConnected: boolean;
  accountId: string | null;
  network: string | null;
  topic: string | null;
}

export class SimpleWalletService {
  private connectionState: WalletConnectionState = {
    isConnected: false,
    accountId: null,
    network: null,
    topic: null,
  };

  private connectionChangeCallbacks: ((state: WalletConnectionState) => void)[] = [];

  constructor() {
    // Check for existing connection in localStorage
    this.checkStoredConnection();
  }

  private checkStoredConnection() {
    try {
      const stored = localStorage.getItem('wallet-connection');
      if (stored) {
        const parsedState = JSON.parse(stored);
        if (parsedState.accountId && parsedState.isConnected) {
          this.connectionState = parsedState;
          console.log('Restored wallet connection from storage:', this.connectionState);
        }
      }
    } catch (error) {
      console.log('No stored wallet connection found');
    }
  }

  private saveConnection() {
    try {
      localStorage.setItem('wallet-connection', JSON.stringify(this.connectionState));
    } catch (error) {
      console.error('Failed to save wallet connection:', error);
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
    console.log('Simple wallet service initialized');
  }

  async connectWallet(): Promise<WalletConnectionState> {
    return new Promise((resolve, reject) => {
      // Show a simple prompt for development/testing
      const accountId = prompt(
        'Enter your Hedera Account ID for testing (format: 0.0.xxxxx):\n\n' +
        'Note: This is a development mode. In production, this would connect to your actual wallet.\n' +
        'You can find your account ID in HashPack or any Hedera wallet.'
      );

      if (!accountId) {
        reject(new Error('Connection cancelled by user'));
        return;
      }

      // Validate account ID format
      if (!this.isValidAccountId(accountId)) {
        reject(new Error('Invalid account ID format. Please use format: 0.0.xxxxx'));
        return;
      }

      // Simulate connection
      this.connectionState = {
        isConnected: true,
        accountId: accountId.trim(),
        network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet',
        topic: 'dev-session-' + Date.now(),
      };

      this.saveConnection();
      this.notifyConnectionChange();

      console.log('Wallet connected (development mode):', this.connectionState);
      resolve(this.connectionState);
    });
  }

  async disconnectWallet(): Promise<void> {
    this.connectionState = {
      isConnected: false,
      accountId: null,
      network: null,
      topic: null,
    };

    try {
      localStorage.removeItem('wallet-connection');
    } catch (error) {
      console.error('Failed to clear stored connection:', error);
    }

    this.notifyConnectionChange();
    console.log('Wallet disconnected');
  }

  async sendTransaction(transactionBytes: Uint8Array, accountId: string): Promise<{
    success: boolean;
    response?: unknown;
    error?: string;
  }> {
    // In development mode, simulate transaction success
    console.log('Simulating transaction for account:', accountId);
    console.log('Transaction bytes length:', transactionBytes.length);

    // Show confirmation dialog
    const confirmed = confirm(
      `Confirm transaction for account ${accountId}?\n\n` +
      `This is development mode - no real transaction will be sent.\n` +
      `Transaction size: ${transactionBytes.length} bytes`
    );

    if (!confirmed) {
      return {
        success: false,
        error: 'Transaction rejected by user'
      };
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock success
    const mockTransactionId = `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}.${Math.floor(Math.random() * 1000000)}`;

    return {
      success: true,
      response: {
        result: {
          transactionId: mockTransactionId
        }
      }
    };
  }

  getConnectionState(): WalletConnectionState {
    return { ...this.connectionState };
  }

  onConnectionChange(callback: (state: WalletConnectionState) => void): void {
    this.connectionChangeCallbacks.push(callback);
  }

  isValidAccountId(accountId: string): boolean {
    // Basic Hedera account ID validation (format: 0.0.xxxxx)
    return /^0\.0\.\d+$/.test(accountId.trim());
  }

  isWalletConnectAvailable(): boolean {
    return true; // Always available in development mode
  }
}

// Singleton instance
export const simpleWalletService = new SimpleWalletService();