import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Join Quiz #${params.id} - Scholaric`,
    description: `Join this educational quiz and start earning cUSD rewards. Review quiz details and terms before participating on Scholaric.`,
    keywords: ['join quiz', 'participate', 'Celo', 'cUSD rewards', 'educational quiz', 'Scholaric'],
    openGraph: {
      title: `Join Quiz #${params.id} - Scholaric`,
      description: `Join this educational quiz and start earning cUSD rewards.`,
      type: 'website',
    },
  }
}

