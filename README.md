# Scholaric

Education Project

A modern Celo blockchain application built with Next.js, TypeScript, and Turborepo.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities
- `apps/hardhat` - Smart contract development environment

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

### Smart Contract Scripts

- `pnpm contracts:compile` - Compile smart contracts
- `pnpm contracts:test` - Run smart contract tests
- `pnpm contracts:deploy` - Deploy contracts to local network
- `pnpm contracts:deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm contracts:deploy:sepolia` - Deploy to Celo Sepolia testnet
- `pnpm contracts:deploy:celo` - Deploy to Celo mainnet

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Smart Contracts**: Hardhat with Viem
- **Monorepo**: Turborepo
- **Package Manager**: PNPM

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS` - Your deployed contract address
   - `NEXT_PUBLIC_CHAIN_ID` - Chain ID (e.g., 11142220 for Celo Sepolia)
   - `NEXT_PUBLIC_WEB3_STORAGE_TOKEN` - IPFS storage token (from Web3.Storage)
   - `NEXT_PUBLIC_WC_PROJECT_ID` - WalletConnect Project ID (optional)
   - `NEXT_PUBLIC_IPFS_GATEWAY` - IPFS gateway URL
3. **Deploy** - Vercel will automatically detect the Next.js app in `apps/web`

### Environment Variables

See `.env.example` files in:
- `apps/web/.env.example` - Frontend environment variables
- `apps/contracts/.env.example` - Contract deployment variables

**⚠️ Important:** Never commit `.env` or `.env.local` files with real secrets!

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)
