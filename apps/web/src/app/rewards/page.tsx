'use client'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, Clock, CheckCircle, ArrowUpRight, Download, Loader2 } from 'lucide-react'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGetAllQuizIds, useGetRewards } from '@/hooks/useQuizContract'
import { usePublicClient } from 'wagmi'
import { QUIZ_MANAGER_ADDRESS } from '@/lib/contracts/addresses'
import quizManagerAbi from '@/lib/contracts/quiz-manager-abi.json'
import { formatEther } from 'viem'
import { useQueryClient } from '@tanstack/react-query'

export default function RewardsPage() {
  const { isConnected, address } = useSafeAccount()
  const router = useRouter()
  
  // All hooks must be called before any early returns
  const { data: allQuizIds, isLoading: isLoadingQuizzes } = useGetAllQuizIds()
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()
  
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingRewards: 0,
    claimedRewards: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    currentRank: 0
  })
  const [rewardHistory, setRewardHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())
  
  // Configurable refresh interval (in milliseconds)
  // Default: 30 seconds (more reasonable than 5 seconds)
  // Adjust as needed: 10000 (10s), 30000 (30s), 60000 (1min), etc.
  const AUTO_REFRESH_INTERVAL = 30000 // 30 seconds

  // Redirect to landing page if wallet is not connected
  useEffect(() => {
    if (!isConnected || !address) {
      const timer = setTimeout(() => {
        router.replace('/')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected, address, router])

  // Fetch rewards data with persistent storage and dynamic updates
  useEffect(() => {
    const fetchRewards = async () => {
      if (!allQuizIds || !address || isLoadingQuizzes) {
        setIsLoading(true)
        return
      }

      setIsLoading(true)
      try {
        let totalEarned = 0
        let claimedRewards = 0
        let pendingRewards = 0
        let quizzesCompleted = 0
        let totalScore = 0
        const history: any[] = []

        // First, check localStorage for simulated rewards (persistent)
        const userRewardBalance = localStorage.getItem('user_reward_balance')
        if (userRewardBalance) {
          totalEarned = parseFloat(userRewardBalance)
          claimedRewards = totalEarned
        }

        for (const quizId of allQuizIds) {
          try {
            // Check localStorage first for simulated reveal
            const isSimulatedRevealed = localStorage.getItem(`quiz_${quizId}_revealed_${address}`)
            const simulatedScore = localStorage.getItem(`quiz_${quizId}_score_${address}`)
            const simulatedReward = localStorage.getItem(`quiz_${quizId}_reward_${address}`)

            if (isSimulatedRevealed && simulatedScore) {
              // Use simulated data
              quizzesCompleted++
              const score = parseInt(simulatedScore)
              const reward = simulatedReward ? parseFloat(simulatedReward) : 0
              
              totalScore += score
              
              history.push({
                id: quizId.toString(),
                quiz: `Quiz #${quizId.toString()}`,
                amount: reward,
                status: 'claimed',
                date: new Date().toISOString().split('T')[0],
                score: score,
                type: 'simulated'
              })
              continue
            }

            // Fall back to blockchain data
            if (!publicClient) continue

            const participantData = await publicClient.readContract({
              address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
              abi: quizManagerAbi,
              functionName: 'getParticipantData',
              args: [quizId, address as `0x${string}`],
            }) as any

            if (participantData && participantData.participant !== '0x0000000000000000000000000000000000000000') {
              const reward = parseFloat(formatEther(participantData.reward))
              const score = Number(participantData.score)
              
              if (participantData.hasRevealed) {
                quizzesCompleted++
                totalScore += score
                
                if (reward > 0) {
                  if (participantData.reward > 0n) {
                    claimedRewards += reward
                  }
                  
                  // Persist blockchain reward data to localStorage
                  localStorage.setItem(
                    `quiz_${quizId}_reward_blockchain_${address}`,
                    reward.toFixed(4)
                  )
                  localStorage.setItem(
                    `quiz_${quizId}_score_blockchain_${address}`,
                    score.toString()
                  )
                  localStorage.setItem(
                    `quiz_${quizId}_revealed_blockchain_${address}`,
                    'true'
                  )
                  
                  history.push({
                    id: quizId.toString(),
                    quiz: `Quiz #${quizId.toString()}`,
                    amount: reward,
                    status: reward > 0 ? 'claimed' : 'pending',
                    date: new Date().toISOString().split('T')[0],
                    score: score,
                    type: 'blockchain'
                  })
                }
              } else if (participantData.hasCommitted) {
                pendingRewards += reward
              }
            }
          } catch (err) {
            // Participant not found in this quiz, skip
            console.debug(`No data for quiz ${quizId} and address ${address}`)
          }
        }

        setStats({
          totalEarned,
          pendingRewards,
          claimedRewards,
          quizzesCompleted,
          averageScore: quizzesCompleted > 0 ? Math.round(totalScore / quizzesCompleted) : 0,
          currentRank: 0 // Would need to calculate from all participants
        })
        setRewardHistory(history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
        setLastUpdateTime(Date.now())
        
        console.log('✅ Rewards fetched and persisted:', {
          totalEarned,
          claimedRewards,
          quizzesCompleted,
          historyCount: history.length,
          nextRefreshIn: `${AUTO_REFRESH_INTERVAL / 1000}s`
        })
      } catch (err) {
        console.error('Error fetching rewards:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRewards()
    
    // Set up auto-refresh at configurable interval to catch distributed rewards
    // Default: 30 seconds (reduced from 5 seconds for better performance)
    // Event listeners will catch immediate updates anyway
    const interval = setInterval(() => {
      fetchRewards()
    }, AUTO_REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [allQuizIds, address, isLoadingQuizzes, publicClient])
  
  // Listen for reward distribution events and invalidate queries
  useEffect(() => {
    const handleRewardDistribution = () => {
      console.log('🔄 Reward distribution detected, refreshing...')
      queryClient.invalidateQueries({ queryKey: ['getParticipantData'] })
      queryClient.invalidateQueries({ queryKey: ['getRewards'] })
    }
    
    // Trigger refresh when storage changes (from other tabs)
    window.addEventListener('storage', handleRewardDistribution)
    
    return () => {
      window.removeEventListener('storage', handleRewardDistribution)
    }
  }, [queryClient])

  // Show loading state while checking connection (after all hooks)
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Your Rewards</h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Track your earnings, claim pending rewards, and view your quiz performance history.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="space-y-6 sm:space-y-8">
              {/* Stats Overview */}
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading rewards...</p>
                </div>
              ) : (
                <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 stagger-children">
                <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5 card-hover">
                  <CardContent className="p-4 sm:p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      <Badge variant="secondary" className="text-xs">Total</Badge>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      ${stats.totalEarned.toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Total Earned (cUSD)
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border card-hover">
                  <CardContent className="p-4 sm:p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                        Pending
                      </Badge>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      ${stats.pendingRewards.toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Pending Rewards
                    </div>
                    <Button size="sm" className="w-full mt-2 btn-press text-xs sm:text-sm">
                      Claim All
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border card-hover sm:col-span-2 md:col-span-1">
                  <CardContent className="p-4 sm:p-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                        #{stats.currentRank}
                      </Badge>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {stats.averageScore}%
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Average Score
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.quizzesCompleted} quizzes completed
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reward History */}
              <Card className="border-border animate-fade-in">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold">Reward History</h2>
                    <Button variant="outline" size="sm" className="gap-2 btn-press w-full sm:w-auto">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  {rewardHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No rewards yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">Complete quizzes to earn rewards!</p>
                    </div>
                  ) : (
                  <div className="space-y-3 stagger-children">
                    {rewardHistory.map((reward) => (
                      <Card key={reward.id} className="border-border hover:border-primary/50 transition-all card-hover">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-semibold mb-1">
                                {reward.quiz}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{reward.date}</span>
                                <span>•</span>
                                <span>Score: {reward.score}%</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="text-right">
                                <div className="font-bold text-base sm:text-lg text-primary">
                                  ${reward.amount.toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  cUSD
                                </div>
                              </div>

                              {reward.status === 'claimed' ? (
                                <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/20 text-xs">
                                  <CheckCircle className="h-3 w-3" />
                                  Claimed
                                </Badge>
                              ) : (
                                <Button size="sm" className="gap-1 btn-press text-xs sm:text-sm">
                                  Claim
                                  <ArrowUpRight className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
