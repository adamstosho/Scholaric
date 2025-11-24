import type { Metadata } from 'next'

const baseMetadata = {
  applicationName: 'Scholaric',
  authors: [{ name: 'Scholaric Team' }],
  creator: 'Scholaric',
  publisher: 'Scholaric',
  keywords: ['Celo', 'blockchain', 'education', 'quiz', 'cUSD', 'earn', 'learn', 'MiniPay', 'decentralized education'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Scholaric',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@Scholaric',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export function createMetadata({
  title,
  description,
  path = '',
  image = '/icon.svg',
}: {
  title: string
  description: string
  path?: string
  image?: string
}): Metadata {
  const fullTitle = title.includes('Scholaric') ? title : `${title} | Scholaric`
  const url = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}${path}`
    : `https://scholaric.vercel.app${path}`

  return {
    ...baseMetadata,
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: fullTitle,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title: fullTitle,
      description,
      images: [image],
    },
  }
}

// Predefined metadata for each page
export const pageMetadata = {
  home: createMetadata({
    title: 'Scholaric - Learn & Earn with cUSD',
    description: 'Create educational quizzes, fund prize pools, and earn cryptocurrency rewards on the Celo blockchain. Join the decentralized learning revolution where knowledge pays.',
    path: '/',
  }),

  catalogue: createMetadata({
    title: 'Browse Quizzes',
    description: 'Explore educational quizzes on various subjects. Join quizzes, answer questions, and earn cUSD rewards on the Celo blockchain.',
    path: '/catalogue',
  }),

  create: createMetadata({
    title: 'Create Quiz',
    description: 'Create custom educational quizzes with multiple question types. Fund prize pools and engage learners with tokenized rewards on Scholaric.',
    path: '/create',
  }),

  dashboard: createMetadata({
    title: 'Dashboard',
    description: 'View your quiz history, track your earnings, and manage your created quizzes on Scholaric. Monitor your learning progress and rewards.',
    path: '/dashboard',
  }),

  leaderboard: createMetadata({
    title: 'Leaderboard',
    description: 'See top performers across all quizzes on Scholaric. Compete with other learners and climb the rankings to earn more rewards.',
    path: '/leaderboard',
  }),

  rewards: createMetadata({
    title: 'My Rewards',
    description: 'View and claim your earned cUSD rewards from quizzes on Scholaric. Track your earnings and reward history on the Celo blockchain.',
    path: '/rewards',
  }),

  quiz: (quizTitle?: string, quizDescription?: string) => createMetadata({
    title: quizTitle ? `${quizTitle} - Quiz` : 'Quiz Details',
    description: quizDescription || 'Join this educational quiz and earn cUSD rewards for correct answers. Participate in the learn-to-earn experience on Scholaric.',
    path: '/quiz',
  }),

  quizJoin: (quizTitle?: string) => createMetadata({
    title: quizTitle ? `Join ${quizTitle}` : 'Join Quiz',
    description: 'Join an educational quiz and start earning cUSD rewards. Connect your wallet and participate in the learn-to-earn experience.',
    path: '/quiz/join',
  }),

  quizSession: (quizTitle?: string) => createMetadata({
    title: quizTitle ? `${quizTitle} - Taking Quiz` : 'Quiz Session',
    description: 'Answer quiz questions and earn rewards. Your answers are securely committed and will be revealed after the quiz ends.',
    path: '/quiz/session',
  }),

  quizResults: (quizTitle?: string) => createMetadata({
    title: quizTitle ? `${quizTitle} - Results` : 'Quiz Results',
    description: 'View your quiz results and see how you performed. Check your score and claim your cUSD rewards based on your performance.',
    path: '/quiz/results',
  }),

  quizFund: (quizTitle?: string) => createMetadata({
    title: quizTitle ? `Fund ${quizTitle}` : 'Fund Quiz',
    description: 'Add cUSD to the quiz prize pool to incentivize participation. Support educational content and reward learners on Scholaric.',
    path: '/quiz/fund',
  }),
}

