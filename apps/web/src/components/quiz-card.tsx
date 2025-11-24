import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, Users, Clock, BookOpen, CheckCircle, Zap, Eye, Play } from 'lucide-react'
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  description: string
  prizePool: number
  participants: number
  maxParticipants: number
  difficulty: string
  subject: string
  duration: number
  questions: number
  grade: string
  status: 'live' | 'upcoming' | 'ended'
  verified: boolean
  gasSponsored: boolean
  sponsor: string
}

interface QuizCardProps {
  quiz: Quiz
}

export function QuizCard({ quiz }: QuizCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'advanced':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'expert':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'ended':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default:
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  const isFull = quiz.participants >= quiz.maxParticipants
  const participantPercentage = (quiz.participants / quiz.maxParticipants) * 100

  return (
    <Card className="border-border hover:border-primary/50 transition-all hover:shadow-elevation-1 flex flex-col h-full card-hover animate-fade-in">
      <CardContent className="p-4 sm:p-6 flex-1">
        {/* Header Badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
              {quiz.difficulty}
            </Badge>
            {quiz.status === 'live' && (
              <Badge variant="outline" className={getStatusColor(quiz.status)}>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                Live Now
              </Badge>
            )}
          </div>
          {quiz.verified && (
            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
          )}
        </div>

        {/* Title and Description */}
        <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 leading-tight">
          {quiz.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {quiz.description}
        </p>

        {/* Prize Pool */}
        <div className="flex items-center gap-2 mb-3 p-3 bg-primary/5 rounded-lg border border-primary/10 hover:bg-primary/10 transition-colors">
          <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <div>
            <div className="text-base sm:text-lg font-bold text-primary">
              ${quiz.prizePool.toFixed(2)} cUSD
            </div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Participants</span>
            <span className="font-semibold">
              {quiz.participants}/{quiz.maxParticipants}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isFull ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${participantPercentage}%` }}
            />
          </div>
        </div>

        {/* Meta Information */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{quiz.duration} min</span>
            <span>•</span>
            <BookOpen className="h-4 w-4" />
            <span>{quiz.questions} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Grade: {quiz.grade}</span>
            <span>•</span>
            <span>{quiz.subject}</span>
          </div>
          {quiz.gasSponsored && (
            <div className="flex items-center gap-1.5 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Gas Sponsored</span>
            </div>
          )}
        </div>

        {/* Sponsor */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Sponsored by: <span className="font-medium text-foreground">{quiz.sponsor}</span>
          </p>
        </div>
      </CardContent>

      {/* Action Buttons */}
      <CardFooter className="p-4 sm:p-6 pt-0 grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 btn-press text-xs sm:text-sm" asChild>
          <Link href={`/quiz/${quiz.id}/fund`}>
            <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Fund</span>
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 btn-press text-xs sm:text-sm" asChild>
          <Link href={`/quiz/${quiz.id}`}>
            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Details</span>
          </Link>
        </Button>
        <Button
          size="sm"
          className="gap-1.5 btn-press text-xs sm:text-sm"
          disabled={isFull || quiz.status !== 'live'}
          asChild={!isFull && quiz.status === 'live'}
        >
          {isFull || quiz.status !== 'live' ? (
            <>
              <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{isFull ? 'Full' : 'Join'}</span>
            </>
          ) : (
            <Link href={`/quiz/${quiz.id}/join`}>
              <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Join</span>
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
