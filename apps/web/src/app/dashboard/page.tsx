'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Edit, Trash2, Users, Coins, Eye, BarChart3, Loader2, TrendingUp } from 'lucide-react'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGetAllQuizIds, useGetQuiz } from '@/hooks/useQuizContract'
import { usePublicClient } from 'wagmi'
import { QUIZ_MANAGER_ADDRESS } from '@/lib/contracts/addresses'
import quizManagerAbi from '@/lib/contracts/quiz-manager-abi.json'
import { formatEther } from 'viem'

export default function DashboardPage() {
  const { isConnected, address } = useSafeAccount()
  const router = useRouter()
  
  // All hooks must be called before any early returns
  const { data: allQuizIds, isLoading: isLoadingQuizzes } = useGetAllQuizIds()
  const [myQuizzes, setMyQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const publicClient = usePublicClient()

  // Redirect to landing page if wallet is not connected
  useEffect(() => {
    if (!isConnected || !address) {
      const timer = setTimeout(() => {
        router.replace('/')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected, address, router])

  // Fetch quizzes for the connected creator (declared before any early returns)
  useEffect(() => {
    const fetchMyQuizzes = async () => {
      if (!allQuizIds || !address || isLoadingQuizzes || !publicClient) {
        setIsLoading(true)
        return
      }

      setIsLoading(true)
      try {
        const quizzes = []
        for (const quizId of allQuizIds) {
          try {
            const quizData = await publicClient.readContract({
              address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
              abi: quizManagerAbi,
              functionName: 'getQuiz',
              args: [quizId],
            }) as any

            if (quizData.creator?.toLowerCase() === address.toLowerCase()) {
              const now = Math.floor(Date.now() / 1000)
              let status: 'live' | 'upcoming' | 'ended' | 'cancelled' = 'upcoming'
              
              if (quizData.status === 3) {
                status = 'cancelled'
              } else if (quizData.status === 2) {
                status = 'ended'
              } else if (Number(quizData.startTime) <= now && Number(quizData.endTime) > now) {
                status = 'live'
              } else if (Number(quizData.startTime) > now) {
                status = 'upcoming'
              } else {
                status = 'ended'
              }

              quizzes.push({
                id: quizId.toString(),
                title: `Quiz #${quizId.toString()}`,
                status,
                participants: Number(quizData.participantCount),
                prizePool: parseFloat(formatEther(quizData.prizePool)),
                views: 0, // Would need separate tracking
                createdAt: new Date(Number(quizData.startTime) * 1000).toISOString().split('T')[0]
              })
            }
          } catch (err) {
            console.error(`Error fetching quiz ${quizId}:`, err)
          }
        }
        setMyQuizzes(quizzes)
      } catch (err) {
        console.error('Error fetching my quizzes:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyQuizzes()
  }, [allQuizIds, address, isLoadingQuizzes, publicClient])

  // Show loading state while checking connection
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Please connect your wallet...</p>
          </div>
        </main>
      </div>
    )
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">My Dashboard</h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Manage your quizzes and track performance
                </p>
              </div>
              <Button className="gap-2 btn-press w-full sm:w-auto" asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4" />
                  Create Quiz
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 stagger-children">
                <Card className="border-border card-hover">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">{myQuizzes.length}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Quizzes</div>
                  </CardContent>
                </Card>
                <Card className="border-border card-hover">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="text-xl sm:text-2xl font-bold text-green-500">
                      {myQuizzes.filter(q => q.status === 'live').length}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Live Now</div>
                  </CardContent>
                </Card>
                <Card className="border-border card-hover">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">
                      {myQuizzes.reduce((sum, q) => sum + q.participants, 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Participants</div>
                  </CardContent>
                </Card>
                <Card className="border-border card-hover">
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      ${myQuizzes.reduce((sum, q) => sum + q.prizePool, 0).toFixed(0)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Total Prize Pool</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quiz List */}
              <Card className="border-border animate-fade-in">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold">My Quizzes</h2>
                  
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-muted-foreground">Loading your quizzes...</p>
                    </div>
                  ) : myQuizzes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">You haven't created any quizzes yet.</p>
                      <Button className="mt-4 gap-2" asChild>
                        <Link href="/create">
                          <Plus className="h-4 w-4" />
                          Create Your First Quiz
                        </Link>
                      </Button>
                    </div>
                  ) : (
                  <div className="space-y-3 stagger-children">
                    {myQuizzes.map((quiz) => (
                      <Card key={quiz.id} className="border-border hover:border-primary/50 transition-all card-hover">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{quiz.title}</h3>
                                <Badge variant="outline" className={getStatusColor(quiz.status)}>
                                  {quiz.status}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{quiz.participants} participants</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Coins className="h-4 w-4" />
                                  <span>${quiz.prizePool}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{quiz.views} views</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {quiz.status === 'ended' && (
                                <Button variant="ghost" size="sm" title="View results" asChild>
                                  <Link href={`/quiz/${quiz.id}/results`}>
                                    <TrendingUp className="h-4 w-4" />
                                  </Link>
                              </Button>
                              )}
                              <Button variant="ghost" size="sm" title="View quiz" asChild>
                                <Link href={`/quiz/${quiz.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
