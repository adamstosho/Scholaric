'use client'

import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, TrendingUp, Loader2, Users } from 'lucide-react'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGetAllQuizIds } from '@/hooks/useQuizContract'
import { usePublicClient } from 'wagmi'
import { QUIZ_MANAGER_ADDRESS } from '@/lib/contracts/addresses'
import quizManagerAbi from '@/lib/contracts/quiz-manager-abi.json'
import { formatEther } from 'viem'

interface LeaderboardEntry {
  address: string
  totalRewards: number
  totalScore: number
  quizzesCompleted: number
  averageScore: number
  rank: number
}

export default function LeaderboardPage() {
  const { isConnected, address } = useSafeAccount()
  const router = useRouter()
  const { data: allQuizIds, isLoading: isLoadingQuizzes } = useGetAllQuizIds()
  const publicClient = usePublicClient()
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())

  const AUTO_REFRESH_INTERVAL = 15000 // 15 seconds

  // Redirect to landing page if wallet is not connected
  useEffect(() => {
    if (!isConnected || !address) {
      const timer = setTimeout(() => {
        router.replace('/')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected, address, router])

  // Fetch leaderboard data from BLOCKCHAIN (works for all users globally)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!allQuizIds || !Array.isArray(allQuizIds) || (allQuizIds as any[]).length === 0 || isLoadingQuizzes || !publicClient) {
        console.log('⏳ Waiting for blockchain data:', {
          hasAllQuizIds: !!allQuizIds,
          isLoadingQuizzes,
          hasPublicClient: !!publicClient
        })
        setIsLoading(true)
        return
      }

      setIsLoading(true)
      try {
        const participantMap = new Map<string, {
          totalRewards: number
          totalScore: number
          quizzesCompleted: number
        }>()

        console.log('🔍 Fetching leaderboard from blockchain - quizzes to scan:', (allQuizIds as any[]).length)

        // Iterate through all quizzes and collect participant data from blockchain
        for (const quizId of (allQuizIds as any[])) {
          try {
            console.log(`📚 Fetching participants for quiz ${quizId}`)
            
            // Get all participants for this quiz FROM BLOCKCHAIN
            const participants = await publicClient.readContract({
              address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
              abi: quizManagerAbi,
              functionName: 'getParticipants',
              args: [quizId],
            }) as string[]

            console.log(`📚 Quiz ${quizId} has ${participants?.length || 0} blockchain participants`)

            if (!participants || participants.length === 0) continue

            // Get detailed data for each participant FROM BLOCKCHAIN
            for (const participantAddr of participants) {
              const addrLower = participantAddr.toLowerCase()
              try {
                const participantData = await publicClient.readContract({
                  address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
                  abi: quizManagerAbi,
                  functionName: 'getParticipantData',
                  args: [quizId, participantAddr as `0x${string}`],
                }) as any

                if (participantData && participantData.participant !== '0x0000000000000000000000000000000000000000') {
                  // Initialize if not in map
                  if (!participantMap.has(addrLower)) {
                    participantMap.set(addrLower, {
                      totalRewards: 0,
                      totalScore: 0,
                      quizzesCompleted: 0
                    })
                  }

                  const current = participantMap.get(addrLower)!
                  
                  // Check localStorage first for local pending/simulated data
                  const isLocalRevealed = localStorage.getItem(`quiz_${quizId}_revealed_${participantAddr}`)
                  const localScore = localStorage.getItem(`quiz_${quizId}_score_${participantAddr}`)
                  const localReward = localStorage.getItem(`quiz_${quizId}_reward_${participantAddr}`)

                  if (isLocalRevealed && localScore) {
                    // Use local data (more up-to-date for current session)
                    const score = parseInt(localScore)
                    const reward = parseFloat(localReward || '0')
                    
                    console.log(`✅ ${addrLower.slice(0, 10)} quiz ${quizId}: using LOCAL data - score=${score}, reward=$${reward.toFixed(4)}`)
                    
                    current.totalRewards += reward
                    current.totalScore += score
                    current.quizzesCompleted += 1
                  } else if (participantData.hasRevealed) {
                    // Use blockchain data
                    const reward = parseFloat(formatEther(participantData.reward))
                    const score = Number(participantData.score)
                    
                    console.log(`✅ ${addrLower.slice(0, 10)} quiz ${quizId}: using BLOCKCHAIN data - score=${score}, reward=$${reward.toFixed(4)}`)
                    
                    current.totalRewards += reward
                    current.totalScore += score
                    current.quizzesCompleted += 1
                  } else {
                    console.log(`⏸️  ${addrLower.slice(0, 10)} quiz ${quizId}: not revealed yet`)
                  }
                }
              } catch (err) {
                console.error(`❌ Error fetching participant data for ${addrLower} in quiz ${quizId}:`, err)
              }
            }
          } catch (err) {
            console.error(`❌ Error fetching participants for quiz ${quizId}:`, err)
          }
        }

        console.log('📊 Raw participantMap from blockchain:', Array.from(participantMap.entries()))

        // For the current user, also check user_reward_balance (accounts for all accumulated rewards)
        if (address) {
          const userAddr = address.toLowerCase()
          const userRewardBalance = parseFloat(localStorage.getItem('user_reward_balance') || '0')
          
          console.log(`👤 Current user ${userAddr.slice(0, 10)}:`)
          console.log(`   - Calculated from blockchain: $${participantMap.get(userAddr)?.totalRewards.toFixed(4) || '0'}`)
          console.log(`   - user_reward_balance in localStorage: $${userRewardBalance.toFixed(4)}`)
          
          if (userRewardBalance > 0 && participantMap.has(userAddr)) {
            const current = participantMap.get(userAddr)!
            // Use the higher value - user_reward_balance is more authoritative
            if (userRewardBalance > current.totalRewards) {
              console.log(`⚠️  Using user_reward_balance ($${userRewardBalance.toFixed(4)}) instead of blockchain sum ($${current.totalRewards.toFixed(4)})`)
              current.totalRewards = userRewardBalance
            }
          } else if (userRewardBalance > 0 && !participantMap.has(userAddr)) {
            // User exists in user_reward_balance but not in blockchain yet
            console.log(`⚠️  User only in user_reward_balance, adding to leaderboard`)
            participantMap.set(userAddr, {
              totalRewards: userRewardBalance,
              totalScore: 0,
              quizzesCompleted: 0
            })
          }
        }

        // Convert to leaderboard entries and sort by total rewards
        const entries: LeaderboardEntry[] = Array.from(participantMap.entries())
          .filter(([addr, data]) => data.totalRewards > 0 || data.quizzesCompleted > 0)
          .map(([addr, data]) => ({
            address: addr,
            totalRewards: data.totalRewards,
            totalScore: data.totalScore,
            quizzesCompleted: data.quizzesCompleted,
            averageScore: data.quizzesCompleted > 0 
              ? Math.round(data.totalScore / data.quizzesCompleted)
              : 0,
            rank: 0
          }))
          .sort((a, b) => {
            if (b.totalRewards !== a.totalRewards) {
              return b.totalRewards - a.totalRewards
            }
            return b.averageScore - a.averageScore
          })
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }))

        console.log('📊 Final leaderboard entries:', entries.length)
        entries.forEach(e => {
          console.log(`  ${e.rank}. ${e.address.slice(0, 10)} - ${e.quizzesCompleted} quizzes, $${e.totalRewards.toFixed(4)} earned, avg score: ${e.averageScore}`)
        })

        setLeaderboard(entries)

        // Find current user's rank
        if (address) {
          const userEntry = entries.find(e => e.address === address.toLowerCase())
          if (userEntry) {
            console.log(`👑 Current user rank: #${userEntry.rank}`)
            setUserRank(userEntry)
          } else {
            console.log(`❌ Current user not found in leaderboard`)
          }
        }

        setLastUpdateTime(Date.now())
        console.log('✅ Leaderboard updated from blockchain:', {
          totalParticipants: entries.length,
          topParticipant: entries[0]?.address.slice(0, 10),
          userRank: entries.find(e => e.address === address?.toLowerCase())?.rank,
          nextRefreshIn: `${AUTO_REFRESH_INTERVAL / 1000}s`
        })
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
    
    // Auto-refresh at configurable interval
    const interval = setInterval(() => {
      fetchLeaderboard()
    }, AUTO_REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [allQuizIds, isLoadingQuizzes, publicClient, address])

  // Show loading state while checking connection
  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Global Leaderboard</h1>
          </div>
          <p className="text-gray-600">Top performers across all quizzes</p>
        </div>

        {/* User's Rank Card */}
        {userRank && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Rank</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-4xl font-bold text-blue-600">#{userRank.rank}</span>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{address.slice(0, 10)}...</p>
                      <p className="text-sm text-gray-600">{userRank.quizzesCompleted} quizzes completed</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${userRank.totalRewards.toFixed(4)}</p>
                  <p className="text-sm text-gray-600">Total Rewards</p>
                  <p className="text-lg font-semibold text-blue-600 mt-2">{userRank.averageScore} avg score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Leaderboard */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-4 text-gray-600">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No participants yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Address</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quizzes</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Avg Score</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Score</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Rewards</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr 
                        key={entry.address}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          entry.address === address?.toLowerCase() ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {entry.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                            {entry.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                            {entry.rank === 3 && <Medal className="h-5 w-5 text-orange-600" />}
                            <span className={`text-lg font-bold ${
                              entry.rank === 1 ? 'text-yellow-600' : 
                              entry.rank === 2 ? 'text-gray-600' : 
                              entry.rank === 3 ? 'text-orange-600' : 
                              'text-gray-900'
                            }`}>
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {entry.address === address?.toLowerCase() && (
                              <Badge className="bg-blue-100 text-blue-700">You</Badge>
                            )}
                            <span className="font-mono text-sm">{entry.address.slice(0, 10)}...{entry.address.slice(-8)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold">{entry.quizzesCompleted}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">{entry.averageScore}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold">{entry.totalScore}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-green-600">${entry.totalRewards.toFixed(4)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Update Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
