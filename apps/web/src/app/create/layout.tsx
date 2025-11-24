import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata.create

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

