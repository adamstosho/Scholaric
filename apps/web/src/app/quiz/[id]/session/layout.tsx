import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  return pageMetadata.quizSession()
}

export default function QuizSessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

