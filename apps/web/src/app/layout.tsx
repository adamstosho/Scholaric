import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import { WalletProvider } from "@/components/wallet-provider"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Scholaric - Learn & Earn with cUSD',
  description: 'Create educational quizzes, fund prize pools, and earn cryptocurrency rewards on the Celo blockchain.',
  generator: 'v0.app',
  keywords: ['Celo', 'blockchain', 'education', 'quiz', 'cUSD', 'earn', 'learn'],
  authors: [{ name: 'Scholaric' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#35D07F',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans antialiased min-h-screen bg-background text-foreground`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
