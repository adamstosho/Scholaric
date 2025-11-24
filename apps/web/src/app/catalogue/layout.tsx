import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata.catalogue

export default function CatalogueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

