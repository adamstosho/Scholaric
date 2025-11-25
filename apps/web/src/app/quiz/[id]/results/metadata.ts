import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Quiz Results #${params.id} - Scholaric`,
    description: `View your quiz results, score, and earned cUSD rewards. See how you performed and claim your rewards on Scholaric.`,
    keywords: ['quiz results', 'score', 'cUSD rewards', 'claim rewards', 'Celo', 'Scholaric'],
    openGraph: {
      title: `Quiz Results #${params.id} - Scholaric`,
      description: `View your quiz results, score, and earned cUSD rewards.`,
      type: 'website',
    },
  }
}

