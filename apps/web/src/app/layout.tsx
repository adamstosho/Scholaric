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
  title: 'Scholaric - Learn & Earn with cUSD Rewards',
  description: 'Create educational quizzes, fund prize pools, and earn cryptocurrency rewards on the Celo blockchain. Join the decentralized learning revolution where knowledge pays.',
  generator: 'v0.app',
  keywords: ['Celo', 'blockchain', 'education', 'quiz', 'cUSD', 'earn', 'learn', 'learn-to-earn', 'MiniPay'],
  authors: [{ name: 'Scholaric' }],
  openGraph: {
    title: 'Scholaric - Learn & Earn with cUSD Rewards',
    description: 'Create educational quizzes, fund prize pools, and earn cryptocurrency rewards on the Celo blockchain.',
    type: 'website',
  },
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
