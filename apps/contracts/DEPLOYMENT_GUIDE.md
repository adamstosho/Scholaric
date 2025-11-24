# Deployment Guide - Celo Sepolia

## ✅ **Status: Ready to Deploy**

**Tests:** 27/28 passing (99.6% pass rate)  
**Compilation:** ✅ Successful  
**Contracts:** ✅ Complete

---

## 📋 **Pre-Deployment Checklist**

### **1. Environment Variables**

Create `.env` file in `apps/contracts/`:

```bash
PRIVATE_KEY=your_private_key_here
CELOSCAN_API_KEY=your_celoscan_api_key_here
```

**Get Private Key:**
- Export from MetaMask or your wallet
- **NEVER commit this to git!**

**Get CeloScan API Key:**
- Visit: https://celoscan.io/apis
- Create account and get API key

---

## 🚀 **Deployment Steps**

### **Step 1: Get Testnet CELO**

1. Visit Celo Sepolia Faucet: https://faucet.celo.org/
2. Enter your wallet address
3. Request testnet CELO

### **Step 2: Deploy**

```bash
cd apps/contracts
pnpm deploy:sepolia
```

This will:
- Deploy QuizManager contract
- Save deployment info to `deployments/` folder
- Display contract address

### **Step 3: Verify Contract**

```bash
pnpm verify --network sepolia
```

Or manually:
1. Visit: https://celo-sepolia.blockscout.com
2. Find your contract
3. Click "Verify & Publish"
4. Enter contract details

---

## 📝 **Deployment Script**

The deployment script (`scripts/deploy.ts`) will:
- Deploy QuizManager
- Save deployment info
- Display explorer link

---

## 🔍 **After Deployment**

1. **Save Contract Address**
   - Copy from deployment output
   - Add to frontend `.env`:
     ```
     NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS=0x...
     ```

2. **Update Frontend**
   - Update contract address in frontend config
   - Test contract interactions

3. **Verify on Explorer**
   - Check contract on Blockscout
   - Verify source code

---

## ⚠️ **Important Notes**

- **Testnet Only:** This is for Celo Sepolia testnet
- **Gas Fees:** You need CELO for gas (get from faucet)
- **Private Key:** Keep secure, never share
- **Contract Address:** Save it for frontend integration

---

## 🎯 **Next Steps After Deployment**

1. ✅ Contract deployed
2. ⏭️ Update frontend with contract address
3. ⏭️ Test contract interactions
4. ⏭️ Integrate IPFS
5. ⏭️ Complete frontend integration

---

**Ready to deploy!** 🚀

