import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Quiz Session #${params.id} - Scholaric`,
    description: `Take the quiz and answer questions to earn cUSD rewards. Submit your answers securely using the commit-reveal pattern on Scholaric.`,
    keywords: ['quiz session', 'take quiz', 'answer questions', 'Celo', 'cUSD rewards', 'Scholaric'],
    openGraph: {
      title: `Quiz Session #${params.id} - Scholaric`,
      description: `Take the quiz and answer questions to earn cUSD rewards.`,
      type: 'website',
    },
  }
}

