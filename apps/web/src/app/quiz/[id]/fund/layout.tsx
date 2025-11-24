import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  return pageMetadata.quizFund()
}

export default function QuizFundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

