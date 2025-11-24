# Scholaric Favicon Guide

## 🎨 Design Description

The Scholaric favicon features:
- **Book Icon**: Represents education and learning
- **Dollar Sign ($)**: Represents earning rewards (cUSD)
- **Celo Green Background**: Brand color (#35D07F) representing the Celo blockchain
- **Gold Coin**: Highlights the financial rewards aspect
- **Sparkle Effects**: Adds visual interest and represents the "earn" concept

## 📁 Files Created

1. **favicon.svg** (64x64)
   - Main favicon for browser tabs
   - Optimized for small sizes

2. **icon.svg** (512x512)
   - High-resolution app icon
   - Used for PWA and app installations

3. **apple-icon.svg** (180x180)
   - Apple touch icon for iOS devices
   - Rounded square format

4. **manifest.json**
   - PWA manifest file
   - Defines app metadata and icons

## ✅ Implementation

The favicon is already configured in `src/app/layout.tsx`:
- Automatically loads SVG favicons
- Supports all modern browsers
- Includes Apple touch icon
- PWA manifest linked

## 🔄 Converting to ICO (Optional)

If you need a traditional `.ico` file for older browsers:

1. **Online Converter**:
   - Visit: https://convertio.co/svg-ico/
   - Upload `favicon.svg`
   - Download `favicon.ico`
   - Place in `/public/` directory

2. **ImageMagick** (Command Line):
   ```bash
   convert favicon.svg -resize 32x32 favicon.ico
   ```

3. **Add to layout.tsx** (if using ICO):
   ```typescript
   icons: {
     icon: '/favicon.ico',
     // ... other icons
   }
   ```

## 🎯 Color Scheme

- **Primary Green**: #35D07F (Celo brand color)
- **Dark Green**: #1A8A4E (gradient)
- **Gold**: #FFD700 (rewards/earnings)
- **Orange**: #FFA500 (coin accent)
- **White**: #FFFFFF (book pages)

## 📱 Browser Support

- ✅ Chrome/Edge: SVG favicon supported
- ✅ Firefox: SVG favicon supported
- ✅ Safari: SVG favicon supported
- ✅ iOS: Apple touch icon configured
- ✅ Android: PWA manifest configured

## 🚀 Testing

1. **Local Development**:
   - Start dev server: `pnpm dev`
   - Check browser tab for favicon
   - Test on mobile device

2. **Production**:
   - Deploy to Vercel
   - Favicon will be served from `/public/`
   - Check browser tab and mobile home screen

## 📝 Notes

- SVG format provides crisp rendering at any size
- No need for multiple PNG sizes (SVG scales automatically)
- Modern browsers all support SVG favicons
- Fallback to ICO only needed for very old browsers

