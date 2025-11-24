import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata.leaderboard

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

