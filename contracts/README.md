# Smart Contracts

This directory contains the Solidity smart contracts for the Nomos platform, configured for deployment on Hedera Testnet using Hardhat 3.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your Hedera credentials:
- `ACCOUNT_ID`: Your Hedera account ID (format: 0.0.xxxxx)
- `HEX_Encoded_Private_Key`: Your account's private key in hex format
- `EVM_Address`: Your account's EVM-compatible address

## Development

### Compile Contracts
```bash
npm run hardhat:compile
```

### Deploy to Hedera Testnet
```bash
npm run hardhat:deploy -- --network hedera_testnet
```

### Run Tests
```bash
npm run hardhat:test
```

## Important Notes

- **Gas Price**: Hedera requires a minimum gas price of 530 Gwei
- **Network**: Configured for Hedera Testnet (Chain ID: 296)
- **ESM**: This project uses ES modules (`"type": "module"`)

## Contract Addresses

After deployment, contract addresses will be logged to the console and should be added to your `.env` file:

```
CREATOR_REGISTRY_ADDRESS=0x...
```