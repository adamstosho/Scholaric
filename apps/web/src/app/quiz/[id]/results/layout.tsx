import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  return pageMetadata.quizResults()
}

export default function QuizResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

