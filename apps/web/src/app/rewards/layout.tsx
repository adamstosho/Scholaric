import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata.rewards

export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

