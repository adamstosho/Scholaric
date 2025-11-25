import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Quiz #${params.id} - Scholaric`,
    description: `View quiz details, join the quiz, and participate to earn cUSD rewards. Check prize pool, participants, and quiz information on Scholaric.`,
    keywords: ['quiz', 'educational quiz', 'Celo', 'cUSD rewards', 'join quiz', 'Scholaric'],
    openGraph: {
      title: `Quiz #${params.id} - Scholaric`,
      description: `View quiz details and join to earn cUSD rewards on the Celo blockchain.`,
      type: 'website',
    },
  }
}

