# Nomos: Decentralized Creator Economy Platform

## Project Overview

Nomos is a decentralized social media platform that revolutionizes content monetization through AI-powered agent negotiation. Instead of traditional static paywalls, personal AI agents manage dynamic access to premium content by negotiating token-based transactions in real-time on the Hedera network.

### Innovation Summary

Nomos introduces a multi-agent economic model where:
- Creators mint custom Hedera Token Service (HTS) tokens representing access rights to premium content
- Personal AI agents autonomously negotiate content access and pricing on behalf of users and creators
- All value transfers and asset ownership are secured and verified on Hedera Testnet
- Dynamic pricing enables creators to adjust token prices in real-time based on demand

### Problem Statement

Traditional content monetization platforms suffer from:
- Inflexible paywall systems that don't adapt to market conditions
- High platform fees that reduce creator revenue
- Lack of transparency in payment processing
- No direct creator-to-consumer value exchange

Nomos solves these issues by combining Hedera's low-cost, high-speed distributed ledger technology with intelligent agent negotiation to create a truly decentralized creator economy.

## Architecture

### Hybrid On-Chain/Off-Chain Model

Nomos employs a sophisticated hybrid architecture that optimizes for both trust and performance:

**On-Chain Layer (Hedera Testnet)**
- Identity management via Hedera Account IDs
- Value transfer using HBAR cryptocurrency
- Tokenized access rights using Hedera Token Service (HTS)
- Smart contract-based user profile registry (Solidity via Hardhat)
- Verifiable transaction history through Hedera Mirror Nodes

**Off-Chain Layer (Supabase)**
- High-volume application data (posts, user profiles, engagement metrics)
- Agent discovery registry (endpoint URLs)
- Real-time pricing data and creator control panel
- Fast API responses for agent negotiation logic

This architecture ensures that trust-critical operations (payments, token transfers, identity) leverage Hedera's security and finality, while high-frequency operations (content browsing, agent discovery) use traditional databases for optimal performance.

### System Components

The platform consists of a Next.js frontend with HashPack wallet integration, a local EchoGuard agent that mediates requests, CreatorAgent instances hosted on Replit, and the Hedera Testnet handling all payment settlements and token transfers. Supabase provides the off-chain database layer for high-speed operations.

## Technical Stack

### Blockchain & Smart Contracts
- **Hedera Testnet**: Primary blockchain for identity, payments, and token operations
- **Hedera Token Service (HTS)**: Creator token minting and management
- **Hedera SDK (@hashgraph/sdk)**: JavaScript SDK for Hedera network interaction
- **Solidity**: Smart contract language for user profile registry
- **Hardhat**: Development environment for compiling, testing, and deploying Solidity contracts to Hedera's EVM-compatible layer

### Agent Development
- **Node.js**: Runtime for agent logic
- **Express.js**: HTTP server framework for agent endpoints
- **Hedera Agent Kit**: Scaffolding and utilities for Hedera-native agent development
- **create-hedera-agent CLI**: Rapid agent project initialization

### Frontend
- **Next.js 15**: React framework with server-side rendering and TypeScript support
- **TypeScript**: Type-safe development
- **HashConnect**: Official Hedera wallet integration library for HashPack
- **react-hot-toast**: User notification system for transaction status
- **Tailwind CSS**: Utility-first styling framework

### Backend & Database
- **Supabase**: PostgreSQL database with real-time subscriptions and instant REST APIs
- **PostgreSQL**: Relational database for application state

### Infrastructure
- **Replit**: Cloud hosting for CreatorAgent instances
- **Local Development**: EchoGuard agent runs on developer machines

## Hedera Integration Deep Dive

### Why Hedera?

1. **Low Transaction Costs**: Sub-cent transaction fees enable microtransactions for content access
2. **High Throughput**: 10,000+ TPS supports real-time agent negotiations
3. **Fast Finality**: 3-5 second transaction finality ensures smooth user experience
4. **Native Token Service**: HTS provides efficient, secure tokenization without custom smart contracts
5. **Carbon Negative**: Energy-efficient consensus aligns with sustainable development goals
6. **Fair Ordering**: Consensus timestamp prevents front-running and ensures fairness

### Hedera Features Utilized

**Hedera Token Service (HTS)**
- Creators mint fungible tokens representing content access licenses
- Token transfers execute instantly with cryptographic proof
- Built-in treasury management and supply controls
- Low-cost token creation (approximately $1 on mainnet)

**HBAR Cryptocurrency**
- Primary payment method for purchasing creator tokens
- Network fees paid in HBAR (testnet uses free test HBAR)
- Direct peer-to-peer value transfer without intermediaries

**Hedera Accounts**
- Unique Account IDs (format: `0.0.xxxxx`) serve as universal identifiers
- ED25519 cryptographic key pairs for secure transaction signing
- Accounts hold HBAR and HTS token balances

**Mirror Nodes**
- Query historical transaction data for payment verification
- REST API for retrieving account balances and token holdings
- Consensus timestamp validation ensures transaction integrity

**Smart Contracts (EVM-Compatible)**
- UserProfile.sol contract maps Ethereum-style addresses to Supabase user IDs
- Deployed via Hardhat to Hedera's EVM-compatible smart contract layer
- Provides on-chain attestation of user identity

### Hardhat Configuration for Hedera

Nomos uses Hardhat as the Solidity development environment configured for Hedera Testnet deployment. Key features include contract compilation with Solidity 0.8.19, automated deployment scripts, and secure private key management via environment variables.

## Database Schema

The platform uses PostgreSQL (via Supabase) with two primary tables:

**Users Table**: Stores user profiles with Hedera account linkage, agent endpoints, creator token IDs, and dynamic pricing.

**Posts Table**: Contains content posts with premium/public flags and author references.

## Smart Contract

### UserProfile.sol

A Solidity smart contract deployed via Hardhat that creates an immutable on-chain registry linking Hedera accounts to application user profiles. The contract uses a simple mapping structure with event emission for profile registration.

## Agent Architecture

### A2A (Agent-to-Agent) Communication Protocol

Agents communicate via JSON messages over HTTP with four message types: inquiry, offer, denial, and proof of payment. This protocol enables autonomous negotiation between user agents and creator agents without human intervention.

### CreatorAgent Implementation

**Responsibilities**:
1. Receive content access inquiries from EchoGuard agents
2. Check creator's token treasury balance
3. Query user's existing token balance on Hedera
4. Fetch current pricing from Supabase
5. Generate offers or denials based on inventory and pricing
6. Verify HBAR payment transactions via Hedera Mirror Node API
7. Execute HTS token transfers to purchasing users

### EchoGuard Agent Implementation

**Responsibilities**:
1. Receive content unlock requests from frontend
2. Discover creator's agent endpoint via Supabase
3. Forward inquiries to CreatorAgent
4. Relay offers/denials to frontend
5. Forward proof of payment after user signs transaction

## User Flow

### Content Unlock Flow

1. **Discovery**: User browses platform and identifies premium content (marked with `is_premium: true`)
2. **Unlock Initiation**: User clicks "Unlock" button on premium post
3. **Agent Inquiry**: Frontend calls local EchoGuard agent API
4. **Creator Agent Discovery**: EchoGuard queries Supabase for creator's `agent_endpoint_url`
5. **Price Negotiation**: EchoGuard sends inquiry to CreatorAgent, which responds with current token price
6. **Offer Display**: Frontend displays offer (e.g., "10 tokens for 5 HBAR")
7. **User Approval**: User clicks "Approve Purchase"
8. **Wallet Interaction**: HashConnect prompts user to sign HBAR transfer in HashPack wallet
9. **Payment Execution**: User approves, transaction broadcasts to Hedera network
10. **Proof Forwarding**: EchoGuard forwards transaction ID to CreatorAgent
11. **Payment Verification**: CreatorAgent queries Hedera Mirror Node to verify payment
12. **Token Transfer**: CreatorAgent executes HTS token transfer to user's account
13. **Access Granted**: Frontend unlocks content and displays success notification

### Creator Onboarding Flow

1. **Profile Creation**: User creates account and links Hedera wallet via HashConnect
2. **Become Creator**: User navigates to settings and selects "Become a Creator"
3. **Token Minting**: System guides creator through HTS token creation
4. **Agent Deployment**: Creator clicks "Deploy My Agent" (links to Replit template)
5. **Agent Configuration**: Creator configures Replit secrets (private key, Supabase credentials)
6. **Endpoint Registration**: Creator saves agent endpoint URL to Supabase profile
7. **Pricing Setup**: Creator sets initial token price in HBAR
8. **Content Publishing**: Creator begins publishing premium content

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Hedera Testnet account (create at portal.hedera.com)
- HashPack wallet browser extension
- Supabase account (supabase.com)

### Environment Variables

Create `.env.local` in the project root with your Hedera network configuration, Supabase credentials, and agent settings.

### Database Setup

Create a Supabase project and run the SQL schema to initialize users and posts tables with proper relationships and indexes.

### Local Development

Standard Next.js development workflow: install dependencies with `npm install`, run dev server with `npm run dev`, and build for production with `npm run build`.

### Smart Contract Deployment

Deploy contracts to Hedera Testnet using Hardhat: compile with `npx hardhat compile` and deploy with deployment scripts targeting the hedera_testnet network configuration.

## Demo Preparation

### Seeding Demo Data

The project includes a seeding script (`npm run seed`) that populates the database with demo creator accounts, sample posts, and realistic token pricing data for demonstration purposes.

### Running the Full Demo

Start the Supabase project, deploy CreatorAgent instances, run the local EchoGuard agent, start the Next.js frontend, connect your HashPack wallet, and interact with premium content to see the full unlock flow in action.

## Project Structure

The repository is organized into modules: Next.js app directory for frontend, contracts folder for Solidity and Hardhat configuration, agents directory for CreatorAgent and EchoGuard implementations, and seed scripts for demo data population.

## Security Considerations

- Private keys stored securely in environment variables or Replit Secrets
- Agent endpoints use HTTPS in production
- Payment verification through cryptographic transaction IDs
- Row-level security policies on Supabase tables
- Rate limiting on agent endpoints to prevent abuse
- Input validation and sanitization on all user-provided data

## Future Enhancements

- Multi-tier subscription models with recurring token payments
- Content creator analytics dashboard
- Reputation system for creators and agents
- Support for NFT-gated content via Hedera NFTs
- Cross-chain bridging for other token standards
- Mobile applications with native wallet integration

## Technical Challenges Solved

1. **Real-time Price Discovery**: Dynamic pricing synchronized across agents and frontend
2. **Payment Verification**: Robust transaction validation using Hedera Mirror Nodes
3. **Agent Discovery**: Decentralized registry allows creators to host agents anywhere
4. **Atomic Access Control**: Ensures users receive tokens before content unlocks
5. **Scalable Architecture**: Hybrid model prevents blockchain bottlenecks

## License

MIT License - See LICENSE file for details

## Links

- Hedera Documentation: https://docs.hedera.com
- HashPack Wallet: https://www.hashpack.app
- Hardhat Documentation: https://hardhat.org
- Next.js Documentation: https://nextjs.org/docs

Repo layout (created files)

- frontend/ — Minimal Next.js TypeScript scaffold (pages, styles, package.json).
- seed/seed.js — Supabase seeding script to populate `users` and `posts` tables with demo creators and premium posts.
- package.json — Workspace-level scripts for running the frontend dev server and the seed script.

Key components (implementation notes)

1) Supabase schema (recommended SQL)

CREATE TABLE users (
  id uuid primary key,
  hedera_account_id text unique,
  display_name text,
  bio text,
  agent_endpoint_url text,
  creator_token_id text,
  token_price_in_hbar numeric
);

CREATE TABLE posts (
  id uuid primary key,
  author_id uuid references users(id),
  content text,
  is_premium boolean default false
);

2) Solidity / Hardhat (on-chain)

A small contract, `UserProfile.sol`, maps an Ethereum-compatible address to a Supabase user id:

mapping(address => string) public userProfiles;
function registerProfile(string memory supabaseUserId) public { userProfiles[msg.sender] = supabaseUserId; }

Notes: We recommend using Hardhat with the Hedera Testnet RPC (EVM-compatible) and @hashgraph/sdk for HTS operations.

3) Agent-to-agent (A2A) message format

Example JSON messages used by agents:

{ "type": "inquiry", "userAccountId": "0.0.x", "postId": "..." }
{ "type": "offer", "tokenAmount": 10, "hbarPrice": 5, "offerId": "..." }
{ "type": "denial", "reason": "Tokens out of stock." }
{ "type": "proof_of_payment", "transactionId": "0.0.x@..." }

CreatorAgent behavior (Replit template):
- Express server with endpoints for inquiries and proofs of payment.
- On inquiry: check treasury token balance, check user's token balance, fetch price from Supabase, return offer or denial.
- On proof_of_payment: verify HBAR transfer on Hedera mirror node and execute TokenTransferTransaction to deliver HTS tokens.

EchoGuard (local) behavior:
- Local Express server used by the frontend to mediate requests to CreatorAgent endpoints. It forwards inquiries and proofs of payment and returns responses to the UI.

Frontend (Next.js) — current scaffold

- Basic pages and global styles.
- React Hot Toast wired in for notifications.
- Placeholder for HashConnect wallet integration and Unlock flow.

Seed script

- Location: `seed/seed.js`.
- Purpose: Clear and populate `users` and `posts` tables with demo creators and premium posts.
- Environment: set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` before running.

Quickstart (local development)

Prerequisites

- Node.js 18+ and npm or pnpm
- A Supabase project with a `users` and `posts` table as described above
- Hedera Testnet accounts and a funded test wallet (HashPack)

Steps

1. Clone the repository.
2. Create a Supabase project and add the tables shown above.
3. Create a `.env` file with the following variables:

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

4. Run the seed script to populate demo data:

```bash
npm run seed
```

5. Start the frontend (from repo root):

```bash
npm run frontend:dev
```

6. Implement and run the local EchoGuard agent (see Agent notes) and point the UI to it for the Unlock flow.

Demo flow (for the hackathon)

1. Seed the database with demo creators and posts.
2. Start EchoGuard locally and the CreatorAgent (using the Replit template URLs provided in the seeded data).
3. On the frontend, identify a premium post and click Unlock. The EchoGuard agent will:
   - Send an inquiry to the CreatorAgent.
   - Receive an offer with a price in HBAR.
   - Ask the user to sign the HBAR transfer with HashPack/HashConnect.
   - On receipt of proof_of_payment, forward it to the CreatorAgent which will verify and transfer HTS tokens to the purchaser.

Next steps and stretch goals

- Full Hardhat project in `contracts/` with deployment scripts to Hedera Testnet and HTS minting helpers.
- Publish the CreatorAgent Replit template and add a one-click deploy link for creator onboarding.
- Implement a richer frontend: creator settings, token minting UI, and real-time transaction status updates.
- Add unit and integration tests for agents and the seeding flow.

Contributing

Contributions are welcome. Open an issue describing the feature or bug, then submit a PR with tests where applicable.

License

This project is provided under the MIT License.
