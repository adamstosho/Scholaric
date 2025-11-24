# 🚀 Complete Vercel Deployment Guide

A step-by-step guide to deploy your Scholaric app on Vercel.

---

## 📋 Prerequisites

- ✅ GitHub repository (already set up: `https://github.com/adamstosho/Scholaric.git`)
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com) if you don't have one)
- ✅ Your deployed smart contract address
- ✅ Web3.Storage token (for IPFS)

---

## 🔧 Step 1: Prepare Your Code

### 1.1 Commit and Push to GitHub

First, make sure all your changes are committed and pushed:

```bash
# Check current status
git status

# If you have uncommitted changes, commit them
git add .
git commit -m "Prepare for Vercel deployment"

# Push to GitHub (use 'master' since that's your branch name)
git push origin master
```

**Note:** If your GitHub repo uses `main` instead of `master`, you can rename:
```bash
git branch -m master main
git push origin main
```

---

## 🌐 Step 2: Create Vercel Account & Import Project

### 2.1 Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended for easy integration)

### 2.2 Import Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"Scholaric"** and click **"Import"**

---

## ⚙️ Step 3: Configure Project Settings

### 3.1 Project Configuration

Vercel should auto-detect your Next.js app, but verify these settings:

- **Framework Preset:** `Next.js` (should be auto-detected)
- **Root Directory:** `apps/web` ⚠️ **IMPORTANT!**
- **Build Command:** `pnpm build` (or leave default)
- **Output Directory:** `.next` (default)
- **Install Command:** `pnpm install` (or leave default)

**⚠️ Critical:** Make sure **Root Directory** is set to `apps/web` since this is a monorepo!

---

## 🔑 Step 4: Add Environment Variables

This is the most important step! Click **"Environment Variables"** and add:

### Required Variables:

#### 1. Smart Contract Address
```
Name: NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS
Value: 0xc9E6c6990BD99Af280641f659e6543ae9577409c
```
*(Use your actual deployed contract address)*

#### 2. Chain ID
```
Name: NEXT_PUBLIC_CHAIN_ID
Value: 11142220
```
*(This is for Celo Sepolia testnet)*

#### 3. Network Name
```
Name: NEXT_PUBLIC_NETWORK_NAME
Value: Celo Sepolia
```

#### 4. Explorer URL
```
Name: NEXT_PUBLIC_EXPLORER_URL
Value: https://celo-sepolia.blockscout.com
```

#### 5. IPFS Gateway
```
Name: NEXT_PUBLIC_IPFS_GATEWAY
Value: https://ipfs.io/ipfs/
```

#### 6. Web3.Storage Token (REQUIRED)
```
Name: NEXT_PUBLIC_WEB3_STORAGE_TOKEN
Value: your_web3_storage_token_here
```

**How to get Web3.Storage token:**
1. Go to [web3.storage](https://web3.storage/)
2. Sign up (free tier available - 5GB)
3. Click **"Create API Token"**
4. Copy the token and paste it here

### Optional Variables:

#### 7. WalletConnect Project ID (Recommended)
```
Name: NEXT_PUBLIC_WC_PROJECT_ID
Value: your_walletconnect_project_id
```

**How to get WalletConnect Project ID:**
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com/)
2. Sign up / Login
3. Create a new project
4. Copy the Project ID

#### 8. App Configuration (Optional)
```
Name: NEXT_PUBLIC_APP_NAME
Value: Scholaric

Name: NEXT_PUBLIC_APP_URL
Value: https://your-app.vercel.app
(You'll get this after first deployment)

Name: NEXT_PUBLIC_ENV
Value: production
```

### 4.1 Add Variables for All Environments

Make sure to add each variable for:
- ✅ **Production**
- ✅ **Preview** (optional, but recommended)
- ✅ **Development** (optional)

---

## 🚀 Step 5: Deploy!

1. After adding all environment variables, click **"Deploy"**
2. Vercel will:
   - Install dependencies (`pnpm install`)
   - Build your app (`pnpm build`)
   - Deploy to production

3. Wait 2-5 minutes for the build to complete

---

## ✅ Step 6: Verify Deployment

### 6.1 Check Build Logs

- Watch the build process in real-time
- If there are errors, check the logs
- Common issues:
  - Missing environment variables
  - Build errors in TypeScript
  - Missing dependencies

### 6.2 Test Your Deployment

Once deployed, you'll get a URL like:
```
https://scholaric.vercel.app
```

**Test these features:**
- ✅ Page loads correctly
- ✅ Wallet connection works
- ✅ Can view quizzes
- ✅ Can create quizzes (if you have IPFS token)
- ✅ Contract interactions work

---

## 🔄 Step 7: Set Up Automatic Deployments

Vercel automatically:
- ✅ Deploys on every push to `master`/`main` branch
- ✅ Creates preview deployments for pull requests
- ✅ Updates production when you merge

**To trigger a new deployment:**
```bash
git push origin master
```

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Make sure `pnpm install` runs successfully
- Check that all dependencies are in `package.json`

**Error: "Environment variable not found"**
- Double-check all required variables are added
- Make sure variable names start with `NEXT_PUBLIC_` for client-side vars

**Error: "Build command failed"**
- Check build logs for specific errors
- Try building locally: `cd apps/web && pnpm build`

### App Doesn't Work After Deployment

**Wallet won't connect:**
- Check `NEXT_PUBLIC_WC_PROJECT_ID` is set
- Verify network configuration

**Can't create quizzes:**
- Check `NEXT_PUBLIC_WEB3_STORAGE_TOKEN` is valid
- Test IPFS token at [web3.storage](https://web3.storage/)

**Contract interactions fail:**
- Verify `NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS` is correct
- Check `NEXT_PUBLIC_CHAIN_ID` matches your network

### Wrong Root Directory

If Vercel can't find your app:
1. Go to **Project Settings** → **General**
2. Set **Root Directory** to `apps/web`
3. Redeploy

---

## 📝 Quick Reference

### Minimum Required Environment Variables:
```
NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11142220
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Vercel Configuration:
- **Root Directory:** `apps/web`
- **Framework:** Next.js (auto-detected)
- **Build Command:** `pnpm build`
- **Node Version:** 18.x or higher

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Project imported in Vercel
- [ ] Root directory set to `apps/web`
- [ ] All environment variables added
- [ ] Build completed successfully
- [ ] App accessible at Vercel URL
- [ ] Wallet connection works
- [ ] Contract interactions work
- [ ] IPFS uploads work (if applicable)

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Web3.Storage](https://web3.storage/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Your GitHub Repo](https://github.com/adamstosho/Scholaric)

---

## 💡 Pro Tips

1. **Use Preview Deployments:** Test changes in preview before merging to production
2. **Monitor Build Logs:** Always check logs if something goes wrong
3. **Environment Variables:** Keep a backup list of all your env vars
4. **Custom Domain:** Add your own domain in Vercel project settings
5. **Analytics:** Enable Vercel Analytics to track your app performance

---

**Need help?** Check Vercel's [documentation](https://vercel.com/docs) or their [support](https://vercel.com/support).

