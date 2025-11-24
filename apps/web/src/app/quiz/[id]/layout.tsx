import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  // You can fetch quiz data here if needed
  return pageMetadata.quiz()
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

