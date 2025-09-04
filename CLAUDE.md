# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edu3 is a Web3 educational platform (Web3 University) that uses a hybrid Web2+Web3 architecture. The platform allows creators to create courses, students to purchase them with YDToken (a custom ERC-20 token), and ownership verification through blockchain technology. The project consists of smart contracts, a subgraph for indexing, a React frontend, and a Node.js backend with PostgreSQL database.

## Architecture

- **Smart Contracts** (`contracts/`): Solidity contracts for course platform and YD token
- **Frontend** (`frontend/`): React + TypeScript + Vite + TailwindCSS + Wagmi
- **Backend** (`backend/`): Node.js + Express + PostgreSQL API server  
- **Subgraph** (`graph/platform-subgraph/`): The Graph protocol indexer for blockchain events
- **Documentation** (`docs/`): Project whitepaper and documentation in Chinese

## Common Development Commands

### Smart Contracts (contracts/)
```bash
# Install dependencies
pnpm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local hardhat network
npx hardhat ignition deploy ignition/modules/CoursePlatformDeployment.ts

# Deploy to Sepolia testnet
npx hardhat ignition deploy --network sepolia ignition/modules/CoursePlatformDeployment.ts

# Verify contracts on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Frontend (frontend/)
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Preview production build
pnpm preview
```

### Backend (backend/)
```bash
# Install dependencies
pnpm install

# Start server
node server.js

# Start with PostgreSQL via Docker
docker-compose up -d
```

### Subgraph (graph/platform-subgraph/)
```bash
# Install dependencies
pnpm install

# Generate code from schema
pnpm codegen

# Build subgraph
pnpm build

# Run tests
pnpm test

# Deploy to The Graph Studio
pnpm deploy

# Deploy locally
pnpm deploy-local
```

## Key Contract Architecture

### Core Smart Contracts
- **YDToken.sol**: ERC-20 token used as platform currency
- **CoursePlatform.sol**: Main platform contract handling course creation and purchases

### Key Contract Functions
- `createCourse(uint256 courseId, uint256 priceInYd)`: Creates a new course on-chain
- `purchaseCourse(uint256 courseId)`: Purchase course with YD tokens
- `courseOwnership[courseId][student]`: Mapping to check course ownership

### Events
- `CourseCreated(uint256 indexed courseId, address indexed creator, uint256 priceInYd)`
- `CoursePurchased(uint256 indexed courseId, address indexed student, address indexed creator)`

## Database Schema (PostgreSQL)

The backend uses PostgreSQL with the following key table:
- **courses**: Stores course metadata with both UUID (off-chain) and chain_id (on-chain) identifiers

## Frontend Web3 Integration

- Uses Wagmi for Ethereum interactions
- Viem for low-level blockchain operations  
- TailwindCSS for styling
- React Query for API state management
- Connects to both backend API and smart contracts

## Backend API Endpoints

- `POST /courses`: Create new course metadata
- `GET /courses/:id`: Get course details (supports both UUID and chain_id)

## Development Workflow

1. **Smart Contract Changes**: Update contracts → compile → test → deploy → update frontend contract configs
2. **Frontend Changes**: Update React components → test locally → build
3. **Backend Changes**: Update API routes → test with database → restart server
4. **Subgraph Changes**: Update schema/mappings → codegen → build → deploy

## Environment Variables

### Contracts
- `SEPOLIA_RPC_URL`: Sepolia testnet RPC URL
- `SEPOLIA_PRIVATE_KEY`: Private key for deployment
- `ETHERSCAN_API_KEY`: For contract verification

### Backend  
- `PORT`: Server port (default 4000)
- Database connection details for PostgreSQL

## Testing

- **Contracts**: Use `npx hardhat test` for Solidity and Node.js integration tests
- **Subgraph**: Use `pnpm test` for AssemblyScript tests with Matchstick
- **Frontend**: No test framework configured currently
- **Backend**: No test framework configured currently

## Deployment Information

- **Network**: Sepolia testnet
- **CoursePlatform Contract**: `0x537feaEaAe0B3B2dF87AfB3cA349C1fd118DbCf8`
- **Subgraph Start Block**: `9118862`

## Key Dependencies

- **Smart Contracts**: Hardhat 3, OpenZeppelin, Viem
- **Frontend**: React 19, Vite, Wagmi, TailwindCSS 4
- **Backend**: Express, PostgreSQL (pg), UUID
- **Subgraph**: The Graph CLI, AssemblyScript