# 🚀 Deployment Checklist for Vercel

## ✅ Pre-Deployment Security Check

- [x] All `.env` and `.env.local` files are in `.gitignore`
- [x] No hardcoded API keys, secrets, or private keys in code
- [x] Build artifacts (`.next`, `dist`, `build`) are ignored
- [x] Unnecessary documentation files removed
- [x] `vercel.json` configured for monorepo

## 📋 Environment Variables for Vercel

Add these in your Vercel project settings:

### Required:
- `NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS` - Your deployed contract address
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID (11142220 for Celo Sepolia)
- `NEXT_PUBLIC_WEB3_STORAGE_TOKEN` - Get from https://web3.storage/
- `NEXT_PUBLIC_IPFS_GATEWAY` - `https://ipfs.io/ipfs/`

### Optional:
- `NEXT_PUBLIC_WC_PROJECT_ID` - WalletConnect Project ID
- `NEXT_PUBLIC_APP_NAME` - App name
- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL

## 🔒 Security Notes

✅ **Safe to commit:**
- `.env.example` files (templates only)
- Public contract addresses
- Public token addresses (Celo tokens)

❌ **Never commit:**
- `.env` or `.env.local` files
- Private keys
- API keys or secrets
- Build artifacts

## 📦 Deployment Steps

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `apps/web`
4. Add environment variables
5. Deploy!

## 🔍 Final Verification

Before pushing to GitHub, verify:
```bash
# Check for any .env files being tracked
git ls-files | grep -E "\.env$|\.env\."

# Check for secrets in code (should return nothing)
grep -r "PRIVATE_KEY\|SECRET\|API_KEY" apps/ --include="*.ts" --include="*.tsx" --include="*.js"

# Verify .gitignore is working
git status --ignored | grep -E "\.env|\.next|node_modules"
```

