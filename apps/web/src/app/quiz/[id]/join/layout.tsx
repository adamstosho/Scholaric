import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  return pageMetadata.quizJoin()
}

export default function QuizJoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

