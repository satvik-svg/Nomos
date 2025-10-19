Nomos — Decentralized Creator Economy (Hackathon)

Overview

Nomos is a hybrid on-chain/off-chain platform that enables a decentralized creator economy driven by personal AI agents. Creators mint HTS tokens to gate premium content and configure dynamic pricing via a Supabase-backed control panel. Personal agents negotiate access and perform payments on Hedera Testnet, enabling real-time, agent-mediated microtransactions without static paywalls.

High-level vision and evolution

- From AI "firewall" to a multi-agent economy: The concept evolved from a simple content filter to an economic model where creators mint and sell tokens representing access rights.
- Dynamic creator control: Creators can set and update token prices in real time in Supabase; their agents fetch prices and negotiate with requesters.
- Hybrid trust and speed model: Hedera handles identity, payment settlement, and asset ownership while Supabase stores high-volume app data and provides low-latency APIs for agent logic.
- Demo-focused polish: The project includes a seeding script, toast notifications, and a clear demo flow to make agent negotiations visible and compelling.

Core architecture

- On-chain (Trust layer): Hedera Testnet (HBAR + HTS) for account identity, tokenized access (HTS), and verifiable value transfer.
- Off-chain (Speed layer): Supabase (Postgres + Auth + Realtime) for application data, agent discovery (agent_endpoint_url), and dynamic pricing.
- Agents: Node.js-based CreatorAgent (hosted as a Replit template) and local EchoGuard agent (localhost) using create-hedera-agent scaffolding and the Hedera SDK.
- Frontend: Next.js + TypeScript, with HashConnect for wallet integration and react-hot-toast for UX notifications.

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
