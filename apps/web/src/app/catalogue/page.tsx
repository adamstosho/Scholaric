'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { QuizCard } from '@/components/quiz-card'
import { QuizFilters, type FilterState } from '@/components/quiz-filters'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { useGetAllQuizIds } from '@/hooks/useQuizContract'
import { fetchQuizMetadata } from '@/lib/ipfs'
import { formatEther } from 'viem'
import { usePublicClient } from 'wagmi'
import { QUIZ_MANAGER_ADDRESS } from '@/lib/contracts/addresses'
import quizManagerAbi from '@/lib/contracts/quiz-manager-abi.json'
import { getIpfsHash } from '@/lib/ipfs-storage'

interface QuizData {
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
  status: 'live' | 'upcoming' | 'ended' | 'cancelled'
  verified: boolean
  gasSponsored: boolean
  sponsor: string
}

export default function CataloguePage() {
  const { data: quizIds, isLoading: isLoadingIds, error: idsError } = useGetAllQuizIds()
  const publicClient = usePublicClient()
  const [allQuizzes, setAllQuizzes] = useState<QuizData[]>([])
  const [quizzes, setQuizzes] = useState<QuizData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('Most Recent')
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedSubjects: [],
    selectedDifficulties: [],
    minPrizePool: '',
    maxPrizePool: '',
    gasSponsored: false,
    verifiedOnly: false,
  })

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      if (isLoadingIds || !quizIds || !publicClient) {
        setIsLoading(true)
        return
      }

      if (quizIds.length === 0) {
        setQuizzes([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const quizPromises = quizIds.map(async (quizId: bigint) => {
          try {
            // Fetch quiz data from contract
            const quizData = await publicClient.readContract({
              address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
              abi: quizManagerAbi,
              functionName: 'getQuiz',
              args: [quizId],
            }) as any

            // Determine status
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

            // Try to fetch metadata from IPFS
            let metadata = null
            try {
              // Get IPFS hash from localStorage
              const ipfsHash = getIpfsHash(quizId.toString())
              
              if (ipfsHash) {
                // Fetch metadata from IPFS
                metadata = await fetchQuizMetadata(ipfsHash)
              } else {
                // Fallback if IPFS hash not found
                console.warn(`IPFS hash not found for quiz ${quizId.toString()}`)
                metadata = {
                  title: `Quiz #${quizId.toString()}`,
                  description: "Educational quiz on CeloScholar",
                  subject: "General",
                  difficulty: "Intermediate",
                  grade: "9-12",
                  questions: [],
                }
              }
            } catch (err) {
              console.error(`Failed to fetch metadata for quiz ${quizId}:`, err)
              // Use fallback on error
              metadata = {
                title: `Quiz #${quizId.toString()}`,
                description: "Educational quiz on CeloScholar",
                subject: "General",
                difficulty: "Intermediate",
                grade: "9-12",
                questions: [],
              }
            }

            return {
              id: quizId.toString(),
              title: metadata?.title || `Quiz #${quizId.toString()}`,
              description: metadata?.description || "No description available",
              prizePool: parseFloat(formatEther(quizData.prizePool)),
              participants: Number(quizData.participantCount),
              maxParticipants: Number(quizData.maxParticipants),
              difficulty: metadata?.difficulty || "Intermediate",
              subject: metadata?.subject || "General",
              duration: Number(quizData.duration) / 60, // Convert seconds to minutes
              questions: metadata?.questions?.length || 0,
              grade: metadata?.grade || "9-12",
              status,
              verified: quizData.isVerified,
    gasSponsored: false,
              sponsor: "CeloScholar",
            } as QuizData
          } catch (err) {
            console.error(`Error fetching quiz ${quizId}:`, err)
            return null
          }
        })

        const results = await Promise.all(quizPromises)
        const validQuizzes = results.filter((q): q is QuizData => q !== null)
        setAllQuizzes(validQuizzes)
        setQuizzes(validQuizzes)
      } catch (err: any) {
        console.error('Error fetching quizzes:', err)
        setError(err.message || 'Failed to fetch quizzes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllQuizzes()
  }, [quizIds, isLoadingIds, publicClient])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allQuizzes]

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query) ||
        quiz.subject.toLowerCase().includes(query)
      )
    }

    // Apply subject filter (case-insensitive)
    if (filters.selectedSubjects.length > 0) {
      filtered = filtered.filter(quiz => 
        filters.selectedSubjects.some(subject => 
          subject.toLowerCase() === quiz.subject.toLowerCase()
        )
      )
    }

    // Apply difficulty filter (case-insensitive)
    if (filters.selectedDifficulties.length > 0) {
      filtered = filtered.filter(quiz => 
        filters.selectedDifficulties.some(difficulty => 
          difficulty.toLowerCase() === quiz.difficulty.toLowerCase()
        )
      )
    }

    // Apply prize pool filter
    if (filters.minPrizePool) {
      const min = parseFloat(filters.minPrizePool)
      if (!isNaN(min)) {
        filtered = filtered.filter(quiz => quiz.prizePool >= min)
      }
    }
    if (filters.maxPrizePool) {
      const max = parseFloat(filters.maxPrizePool)
      if (!isNaN(max)) {
        filtered = filtered.filter(quiz => quiz.prizePool <= max)
      }
    }

    // Apply gas sponsored filter
    if (filters.gasSponsored) {
      filtered = filtered.filter(quiz => quiz.gasSponsored)
    }

    // Apply verified filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(quiz => quiz.verified)
    }

    // Apply sorting
    switch (sortBy) {
      case 'Highest Prize Pool':
        filtered.sort((a, b) => b.prizePool - a.prizePool)
        break
      case 'Most Popular':
        filtered.sort((a, b) => b.participants - a.participants)
        break
      case 'Ending Soon':
        // Sort by status: live first, then upcoming by start time
        filtered.sort((a, b) => {
          if (a.status === 'live' && b.status !== 'live') return -1
          if (a.status !== 'live' && b.status === 'live') return 1
          return 0
        })
        break
      case 'Most Recent':
      default:
        // Sort by ID (newest first)
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id))
        break
    }

    setQuizzes(filtered)
  }, [allQuizzes, filters, sortBy])

  // Show loading state
  if (isLoading || isLoadingIds) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading quizzes...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show error state
  if (error || idsError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Error loading quizzes</p>
            <p className="text-sm text-muted-foreground mt-2">{error || 'Failed to fetch quiz IDs'}</p>
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Quiz Catalogue</h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Browse and discover educational quizzes across various subjects. Join live quizzes or create your own.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:w-64 flex-shrink-0 animate-fade-in">
                <QuizFilters filters={filters} onFiltersChange={setFilters} />
              </aside>

              {/* Quiz Grid */}
              <div className="flex-1">
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{quizzes.length}</span> {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                  </p>
                  <select 
                    className="text-sm border border-input bg-background px-3 py-2 rounded-md w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option>Most Recent</option>
                    <option>Highest Prize Pool</option>
                    <option>Most Popular</option>
                    <option>Ending Soon</option>
                  </select>
                </div>

                {quizzes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No quizzes found.</p>
                    <p className="text-sm text-muted-foreground mt-2">Be the first to create a quiz!</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 stagger-children">
                    {quizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                  ))}
                </div>
                )}

                {/* Pagination */}
                <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled className="btn-press">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" className="btn-press">1</Button>
                  <Button variant="outline" size="sm" className="btn-press">2</Button>
                  <Button variant="outline" size="sm" className="btn-press">3</Button>
                  <Button variant="outline" size="sm" className="btn-press">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
