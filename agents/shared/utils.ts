import { Client, PrivateKey, AccountId, TokenId } from '@hashgraph/sdk';
import { A2AMessage } from './types.js';

export function createHederaClient(accountId: string, privateKey: string, network: 'testnet' | 'mainnet' = 'testnet'): Client {
  const client = network === 'testnet' ? Client.forTestnet() : Client.forMainnet();
  
  return client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromStringECDSA(privateKey)
  );
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateOfferId(): string {
  return `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createA2AMessage<T extends A2AMessage>(
  type: T['type'],
  from: string,
  to: string,
  data: T['data']
): T {
  return {
    id: generateMessageId(),
    timestamp: Date.now(),
    from,
    to,
    type,
    data
  } as T;
}

export function validateHederaAccountId(accountId: string): boolean {
  try {
    AccountId.fromString(accountId);
    return true;
  } catch {
    return false;
  }
}

export function validateTokenId(tokenId: string): boolean {
  try {
    TokenId.fromString(tokenId);
    return true;
  } catch {
    return false;
  }
}

export function convertHbarToTinybar(hbar: number): number {
  return Math.floor(hbar * 100_000_000); // 1 HBAR = 100,000,000 tinybars
}

export function convertTinybarToHbar(tinybar: number): number {
  return tinybar / 100_000_000;
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function logWithTimestamp(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}