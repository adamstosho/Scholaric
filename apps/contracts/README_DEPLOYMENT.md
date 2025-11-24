# QuizManager Contract Deployment Guide
## Celo Sepolia Testnet

This guide covers deploying the QuizManager contract to **Celo Sepolia Testnet**.

---

## Prerequisites

1. **Node.js** (v18+)
2. **PNPM** package manager
3. **Celo Sepolia Testnet** access
4. **Test CELO** for gas fees (get from [faucet](https://faucet.celo.org/celo-sepolia))

---

## Setup

### 1. Install Dependencies

```bash
cd apps/contracts
pnpm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add:
```env
PRIVATE_KEY=your_private_key_without_0x_prefix
CELOSCAN_API_KEY=your_blockscout_api_key_optional
```

⚠️ **Security**: Never commit `.env` file to git!

### 3. Get Test CELO

1. Visit [Celo Sepolia Faucet](https://faucet.celo.org/celo-sepolia)
2. Connect your wallet
3. Request test CELO

---

## Compile Contracts

```bash
pnpm compile
```

This will:
- Compile all Solidity contracts
- Generate TypeScript types
- Create artifacts in `artifacts/` directory

---

## Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage
```

---

## Deploy to Celo Sepolia

### Deploy Contract

```bash
pnpm deploy:sepolia
```

This will:
1. Deploy QuizManager contract
2. Save deployment info to `deployments/` directory
3. Display contract address and explorer link

### Expected Output

```
============================================================
Deploying QuizManager to Celo Sepolia Testnet
============================================================
Deployer address: 0x...
Deployer balance: 1.5 CELO
Network: sepolia
============================================================

📝 Deploying QuizManager contract...
✅ QuizManager deployed to: 0x...

📄 Deployment info saved to: deployments/deployment-sepolia-xxx.json

============================================================
Deployment Summary:
============================================================
{
  "network": "sepolia",
  "chainId": 11142220,
  "contractName": "QuizManager",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "timestamp": "2025-01-XX...",
  "blockNumber": 12345,
  "explorer": "https://celo-sepolia.blockscout.com/address/0x..."
}
============================================================

🔍 View on explorer: https://celo-sepolia.blockscout.com/address/0x...
✅ Deployment complete!
```

---

## Verify Contract

After deployment, verify the contract on Blockscout:

```bash
# Set contract address in .env
CONTRACT_ADDRESS=0x_your_deployed_address

# Verify
pnpm verify
```

Or manually verify on [Blockscout](https://celo-sepolia.blockscout.com/):
1. Go to your contract address
2. Click "Verify & Publish"
3. Select "Via Standard JSON Input"
4. Upload `artifacts/build-info/` files

---

## Update Frontend

After deployment, update your frontend with the contract address:

1. Copy the contract address from deployment output
2. Update `apps/web/src/lib/contracts/addresses.ts`:

```typescript
export const QUIZ_MANAGER_ADDRESS = "0x_your_deployed_address";
```

3. Get the ABI from `apps/contracts/artifacts/contracts/QuizManager.sol/QuizManager.json`
4. Update `apps/web/src/lib/contracts/quiz-manager-abi.ts` with the ABI

---

## Network Information

### Celo Sepolia Testnet

- **Chain ID**: 11142220
- **RPC URL**: `https://forno.celo-sepolia.celo-testnet.org`
- **Explorer**: https://celo-sepolia.blockscout.com
- **Faucet**: https://faucet.celo.org/celo-sepolia
- **Native Token**: CELO

---

## Troubleshooting

### "Insufficient funds"
- Get more test CELO from faucet
- Check your balance: `pnpm hardhat run scripts/check-balance.ts --network sepolia`

### "Nonce too high"
- Wait a few minutes and try again
- Or manually set nonce in deployment script

### "Contract verification failed"
- Ensure contract is deployed
- Check ABI matches source code
- Try manual verification on Blockscout

---

## Next Steps

1. ✅ Contract deployed
2. ✅ Contract verified
3. 🔄 Update frontend with contract address
4. 🔄 Test contract interactions
5. 🔄 Deploy to mainnet (when ready)

---

## Security Notes

- ⚠️ Never share your private key
- ⚠️ Use testnet for development
- ⚠️ Audit contracts before mainnet deployment
- ⚠️ Test thoroughly on testnet first

---

## Support

- [Celo Docs](https://docs.celo.org/)
- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)

