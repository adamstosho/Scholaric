import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Fund Quiz #${params.id} - Scholaric`,
    description: `Add cUSD to the quiz prize pool to incentivize participation. Fund the quiz and reward learners for correct answers on Scholaric.`,
    keywords: ['fund quiz', 'prize pool', 'cUSD', 'funding', 'Celo', 'Scholaric'],
    openGraph: {
      title: `Fund Quiz #${params.id} - Scholaric`,
      description: `Add cUSD to the quiz prize pool to incentivize participation.`,
      type: 'website',
    },
  }
}

