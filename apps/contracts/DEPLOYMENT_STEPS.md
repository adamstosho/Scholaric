# Deployment Steps - Celo Sepolia

## 📋 **Pre-Deployment Checklist**

### **1. Environment Variables Required**

You need a `.env` file in `apps/contracts/` with:

```bash
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here (optional, for verification)
```

**⚠️ Important:**
- Never commit `.env` to git
- Keep your private key secure
- Use a testnet account (not mainnet!)

### **2. Get Testnet CELO**

You need CELO for gas fees. Get it from:
- **Celo Sepolia Faucet:** https://faucet.celo.org/
- Enter your wallet address
- Request testnet CELO

### **3. Verify Setup**

Before deploying, verify:
- ✅ `.env` file exists with `PRIVATE_KEY`
- ✅ You have testnet CELO in your wallet
- ✅ Contracts compile successfully
- ✅ Tests pass (34/34 ✅)

---

## 🚀 **Deployment Command**

Once ready, run:

```bash
cd apps/contracts
pnpm deploy:sepolia
```

This will:
1. Connect to Celo Sepolia testnet
2. Deploy QuizManager contract
3. Save deployment info to `deployments/` folder
4. Display contract address and explorer link

---

## 📝 **After Deployment**

1. **Save Contract Address**
   - Copy from deployment output
   - Add to frontend `.env`:
     ```
     NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS=0x...
     ```

2. **Verify Contract (Optional)**
   ```bash
   pnpm verify --network sepolia
   ```

3. **View on Explorer**
   - Visit: https://celo-sepolia.blockscout.com
   - Search for your contract address

---

## ⚠️ **Troubleshooting**

**Error: "insufficient funds"**
- Get more testnet CELO from faucet

**Error: "network not found"**
- Check hardhat.config.ts network configuration

**Error: "private key not found"**
- Ensure `.env` file exists with `PRIVATE_KEY`

---

**Ready to deploy!** 🚀

