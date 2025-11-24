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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://scholaric.vercel.app'),
  title: {
    default: 'Scholaric - Learn & Earn with cUSD',
    template: '%s | Scholaric',
  },
  description: 'Create educational quizzes, fund prize pools, and earn cryptocurrency rewards on the Celo blockchain. Join the decentralized learning revolution where knowledge pays.',
  generator: 'Next.js',
  keywords: ['Celo', 'blockchain', 'education', 'quiz', 'cUSD', 'earn', 'learn', 'MiniPay', 'decentralized education', 'learn-to-earn'],
  authors: [{ name: 'Scholaric Team' }],
  creator: 'Scholaric',
  publisher: 'Scholaric',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Scholaric',
    title: 'Scholaric - Learn & Earn with cUSD',
    description: 'Create educational quizzes, fund prize pools, and earn cryptocurrency rewards on the Celo blockchain.',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'Scholaric - Learn & Earn with cUSD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scholaric - Learn & Earn with cUSD',
    description: 'Create educational quizzes, fund prize pools, and earn cryptocurrency rewards on the Celo blockchain.',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
