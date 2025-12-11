# Scholaric

**Learn & Earn with Blockchain-Powered Education**

## ✅ **TESTED AND VERIFIED ON MINIPAY**

**This application has been fully tested and verified to work seamlessly with MiniPay!** The app has been tested using the MiniPay Mini App Test tool with ngrok tunneling, ensuring complete compatibility with MiniPay's mobile wallet environment. All features including wallet connection, quiz creation, participation, and cUSD transactions have been verified to work perfectly on MiniPay.

---

## Testing Page on Minipay app 
![Testing_Page1](/apps/web/public/test_scholaric.jpeg)
![Testing_Page1](/apps/web/public/test_scholaric_2.jpeg)

Scholaric is a decentralized educational platform built on the Celo blockchain that rewards learners with cUSD (Celo Dollars) for answering quiz questions correctly. Create educational quizzes, fund prize pools, and earn real cryptocurrency rewards while learning.

Built for the **Celo MiniPay Hackathon** - Educational Games category.

---

## 📖 Table of Contents

- [MiniPay Testing](#-tested-and-verified-on-minipay)
- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Introduction

Scholaric is a learn-to-earn platform that combines education with blockchain technology. Students can participate in quizzes on various subjects, answer questions correctly, and earn cUSD rewards. Teachers and content creators can create quizzes, fund prize pools, and build engaging educational experiences.

The platform uses smart contracts on the Celo blockchain to ensure transparent, fair, and secure reward distribution. All quiz data is stored on IPFS (InterPlanetary File System) for decentralization and permanence.

---

##CHECK OUT THE APP DEMO HERE (Kindly click on the below image to see the video)
[![CheckOutTheVideosHere](/public/111.png)](https://youtu.be/9X8sPOnXlBA)

## 🔍 Problem Statement

Traditional education platforms face several challenges:

1. **Lack of Motivation**: Students often lack financial incentives to engage with educational content
2. **Limited Accessibility**: Quality education is expensive and not accessible to everyone
3. **No Transparency**: Reward systems in traditional platforms are often opaque
4. **High Transaction Costs**: Traditional payment systems charge high fees for small transactions
5. **Geographic Barriers**: Students in developing regions face currency and payment barriers

---

## 💡 Solution

Scholaric solves these problems by:

- **Blockchain Rewards**: Students earn cUSD (stable cryptocurrency) for correct answers, providing real financial motivation
- **Transparent System**: All quiz results and rewards are recorded on the blockchain, ensuring fairness
- **Low-Cost Transactions**: Built on Celo blockchain with MiniPay support for gas-free transactions
- **Global Access**: Anyone with a crypto wallet can participate, regardless of location
- **Decentralized Storage**: Quiz content stored on IPFS ensures permanence and accessibility
- **Fair Distribution**: Smart contracts automatically distribute rewards based on performance

---

## Snapshot of the LANDING PAGE

![Landing Page](/public/screencapture-scholaric-web-vercel-app-2025-11-25-15_14_02.png)

## ✨ Key Features

### For Learners

1. **Browse Quizzes**: Explore a catalogue of educational quizzes on various subjects
2. **Join Quizzes**: Participate in active quizzes by connecting your wallet
3. **Answer Questions**: Submit answers using a secure commit-reveal pattern
4. **Earn Rewards**: Receive cUSD rewards based on your quiz performance
5. **View Leaderboards**: See how you rank compared to other participants
6. **Track Rewards**: Monitor your earnings and reward history

### For Creators

1. **Create Quizzes**: Build custom quizzes with multiple-choice, true/false, or short-answer questions
2. **Fund Prize Pools**: Add cUSD to quiz prize pools to incentivize participation
3. **Manage Quizzes**: Set quiz duration, maximum participants, and start times
4. **View Analytics**: Track quiz participation and performance metrics

## SEE THE DASHBOARD HERE...

![User Dashboard](/public/User-dashboard.png)


## ALSO SEE THE CATALOGUE 
![Catalogue Page](/public/screencapture-scholaric-web-vercel-app-catalogue-2025-11-25-15_15_37.png)

### Platform Features

1. **Secure Commit-Reveal**: Answers are committed as hashes first, then revealed after the quiz ends, preventing cheating
2. **Proportional Rewards**: Rewards are distributed proportionally based on scores
3. **IPFS Storage**: Quiz metadata stored on decentralized IPFS network
4. **MiniPay Integration**: ✅ **Fully tested and verified** - Seamless wallet connection with MiniPay support, tested using MiniPay Mini App Test tool
5. **Mobile-First Design**: Responsive design optimized for mobile devices
6. **Real-Time Updates**: Live updates on quiz status and participant counts

---

## DO YOU KNOW YOU CAN ALSO FILTER THE QUIZZES HERE FOR BEST UX... 

![User Filtering](/public/catalogue-filtering.png)


## THE APP LEADERBOARD
![Leaderboard Page](/public/screencapture-scholaric-web-vercel-app-leaderboard-2025-11-25-15_21_11.png)


## REWARD PAGE
![Reward Page](/public/screencapture-scholaric-web-vercel-app-rewards-2025-11-25-15_19_10.png)


## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query (TanStack Query)
- **Blockchain Integration**: 
  - Wagmi v2
  - Viem v2
  - RainbowKit
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend & Blockchain

- **Blockchain**: Celo Network (Sepolia Testnet)
- **Smart Contracts**: Solidity 0.8.20
- **Development Framework**: Hardhat
- **Testing**: Hardhat Test Suite
- **Storage**: IPFS (via Pinata/Web3.Storage)

### Infrastructure

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Deployment**: Vercel (Frontend)
- **Version Control**: Git

### Key Libraries

- **Blockchain**: `wagmi`, `viem`, `@rainbow-me/rainbowkit`
- **Forms**: `react-hook-form`, `@hookform/resolvers`, `zod`
- **UI**: `@radix-ui/*`, `tailwindcss`, `lucide-react`
- **Utilities**: `date-fns`, `clsx`, `tailwind-merge`

---



## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 8.0.0 or higher
- **Git**: For version control
- **Crypto Wallet**: MetaMask, WalletConnect, or MiniPay


##CHECK OUT THE APP DEMO HERE (Kindly click on the below image to see the video)
[![CheckOutTheVideosHere](/public/111.png)](https://youtu.be/9X8sPOnXlBA)


### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/adamstosho/Scholaric.git
   cd Scholaric
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the `apps/web` directory:

   ```bash
   cd apps/web
   cp .env.example .env.local
   ```

   Fill in the required environment variables (see [Environment Variables](#environment-variables) section).

4. **Start the development server**

   ```bash
   # From the root directory
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

### Smart Contracts Setup

1. **Navigate to contracts directory**

   ```bash
   cd apps/contracts
   ```

2. **Set up environment variables**

   Create a `.env` file:

   ```bash
   PRIVATE_KEY=your_private_key_here
   CELOSCAN_API_KEY=your_celoscan_api_key (optional)
   ```

3. **Compile contracts**

   ```bash
   pnpm compile
   ```

4. **Run tests**

   ```bash
   pnpm test
   ```

5. **Deploy to testnet** (optional)

   ```bash
   pnpm deploy:sepolia
   ```

---

## 📱 How to Use

### For First-Time Users

1. **Connect Your Wallet**
   - Click the "Connect Wallet" button on the homepage
   - Choose your wallet (MetaMask, WalletConnect, or MiniPay)
   - Approve the connection request
   - You'll be redirected to your dashboard

2. **Browse Available Quizzes**
   - Click "Catalogue" in the navigation menu
   - Browse through available quizzes
   - Each quiz shows:
     - Subject and difficulty level
     - Prize pool amount
     - Number of participants
     - Start time and duration

3. **Join a Quiz**
   - Click on a quiz you want to join
   - Review the quiz details
   - Click "Join Quiz" button
   - Confirm the transaction in your wallet
   - Wait for the quiz to start

4. **Take the Quiz**
   - Once the quiz starts, you'll see the questions
   - Select your answers for each question
   - Click "Commit Answers" to submit (answers are hashed for security)
   - Wait for the quiz to end

5. **Reveal Your Answers**
   - After the quiz ends, click "Reveal Answers"
   - Your score will be calculated automatically
   - Rewards will be distributed based on your performance

6. **Claim Your Rewards**
   - Go to the "Rewards" page
   - View your earned rewards
   - Click "Claim" to receive cUSD in your wallet

### For Quiz Creators

1. **Create a New Quiz**
   - Click "Create Quiz" in the navigation menu
   - Fill in the quiz details:
     - Title and description
     - Subject and difficulty
     - Grade level
     - Start time and duration
     - Maximum number of participants
   - Add questions:
     - Question text
     - Answer options (for multiple choice)
     - Correct answer
   - Click "Create Quiz"
   - Confirm the transaction

2. **Fund the Prize Pool**
   - After creating a quiz, you can add funds to the prize pool
   - Click "Fund Quiz" on the quiz page
   - Enter the amount of cUSD you want to add
   - Confirm the transaction
   - The prize pool will be updated

3. **Manage Your Quiz**
   - View quiz statistics on your dashboard
   - Monitor participant count
   - End the quiz early if needed (only creator can do this)

### Navigation Guide

- **Home**: Landing page with features and information
- **Catalogue**: Browse all available quizzes
- **Dashboard**: Your personal dashboard with quiz history
- **Create**: Create a new quiz
- **Leaderboard**: View top performers across all quizzes
- **Rewards**: View and claim your earned rewards

---

## 📁 Project Structure

```
Scholaric/
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router pages
│   │   │   │   ├── catalogue/    # Quiz catalogue page
│   │   │   │   ├── create/       # Quiz creation page
│   │   │   │   ├── dashboard/    # User dashboard
│   │   │   │   ├── leaderboard/  # Leaderboard page
│   │   │   │   ├── quiz/        # Quiz pages (join, session, results)
│   │   │   │   └── rewards/     # Rewards page
│   │   │   ├── components/      # React components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── lib/             # Utility functions and contracts
│   │   │   └── styles/          # Global styles
│   │   ├── public/              # Static assets
│   │   └── package.json
│   │
│   └── contracts/          # Smart contracts
│       ├── contracts/       # Solidity contract files
│       │   └── QuizManager.sol
│       ├── test/           # Contract tests
│       ├── scripts/        # Deployment scripts
│       └── hardhat.config.ts
│
├── package.json            # Root package.json
├── turbo.json             # Turborepo configuration
└── README.md              # This file
```

---

## 🔐 Smart Contracts

### QuizManager Contract

The main smart contract that handles all quiz operations.

**Key Functions:**

- `createQuiz()`: Create a new quiz with metadata
- `fundQuiz()`: Add funds to a quiz prize pool
- `joinQuiz()`: Join an active quiz
- `commitAnswer()`: Submit answer hash (commit phase)
- `revealAnswer()`: Reveal answers and calculate score
- `distributeRewards()`: Distribute rewards to participants
- `endQuiz()`: End a quiz (creator only)
- `cancelQuiz()`: Cancel a quiz and refund participants

**Deployed Contract:**

- **Network**: Celo Mainnet
- **Address**: `0x1469beF9638eE24Bdb39835fD3429D45F7833827`
- **Explorer**: [View on Celoscan](https://celoscan.io/address/0x1469beF9638eE24Bdb39835fD3429D45F7833827)

### Security Features

- **Commit-Reveal Pattern**: Prevents cheating by hiding answers until quiz ends
- **Access Control**: Only quiz creators can end or cancel their quizzes
- **Pausable**: Contract can be paused by owner in case of emergencies
- **Reentrancy Protection**: Protected against reentrancy attacks

---

## 🔑 Environment Variables

### Frontend (`apps/web/.env.local`)

**Required Variables:**

```env
# Smart Contract Configuration (Celo Mainnet)
NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS=0x1469beF9638eE24Bdb39835fD3429D45F7833827
NEXT_PUBLIC_CHAIN_ID=42220
NEXT_PUBLIC_NETWORK_NAME=Celo Mainnet
NEXT_PUBLIC_EXPLORER_URL=https://celoscan.io

# IPFS Configuration (Required for quiz creation)
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_web3_storage_token
# OR use Pinata:
# NEXT_PUBLIC_PINATA_JWT_TOKEN=your_pinata_jwt_token
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

**Optional Variables:**

```env
# WalletConnect (Recommended)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# App Configuration
NEXT_PUBLIC_APP_NAME=Scholaric
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENV=development
```

### Smart Contracts (`apps/contracts/.env`)

```env
# Private Key (Required for deployment)
PRIVATE_KEY=your_private_key_here

# Block Explorer API (Optional - for contract verification)
CELOSCAN_API_KEY=your_celoscan_api_key
```

### Getting API Keys

1. **Web3.Storage Token**:
   - Visit [web3.storage](https://web3.storage/)
   - Sign up for a free account
   - Create an API token
   - Copy and paste into `NEXT_PUBLIC_WEB3_STORAGE_TOKEN`

2. **WalletConnect Project ID**:
   - Visit [cloud.walletconnect.com](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID
   - Paste into `NEXT_PUBLIC_WC_PROJECT_ID`

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Push code to GitHub**

   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `apps/web`
   - Add all environment variables
   - Click "Deploy"

3. **Configure Settings**
   - Framework: Next.js (auto-detected)
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`

### Smart Contract Deployment

1. **Deploy to Celo Mainnet**

   ```bash
   cd apps/contracts
   pnpm deploy:celo
   ```

2. **Verify Contract** (optional)

   ```bash
   pnpm verify --network celo
   ```

3. **Update Frontend**
   - Update `NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS` in `.env.local` with the new contract address
   - Ensure `NEXT_PUBLIC_CHAIN_ID=42220` for mainnet

**Note:** For testnet deployments, use `pnpm deploy:sepolia` or `pnpm deploy:alfajores`

---

## 🧪 Testing

### Frontend

```bash
# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Smart Contracts

```bash
cd apps/contracts

# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Celo Foundation** for the blockchain infrastructure
- **Celo Africa DAO** for hosting the hackathon
- **MiniPay** for seamless mobile wallet integration
- **IPFS** for decentralized storage
- All open-source contributors whose libraries made this project possible

---

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Create an issue](https://github.com/adamstosho/Scholaric/issues)
- **Email**: omoridoh111@gmail.com

---

## 🎯 BUILT FOR CELO MINIPAY HACKATHON 

**✅ TESTED AND VERIFIED ON MINIPAY**

This application has been thoroughly tested using the MiniPay Mini App Test tool with ngrok tunneling. All core functionalities including wallet connection, quiz operations, and cUSD transactions have been verified to work seamlessly on MiniPay.

---

**Built with ❤️ for the Celo ecosystem**

