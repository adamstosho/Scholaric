'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Coins, Users, Clock, BookOpen, CheckCircle, Calendar, Zap, TrendingUp, Play, DollarSign, Share2, Flag, Loader2, AlertCircle, Copy, Check, Twitter, Facebook } from 'lucide-react'
import { useGetQuiz, useGetParticipants, useGetParticipantData, useEndQuiz, useDistributeRewards } from '@/hooks/useQuizContract'
import { fetchQuizMetadata } from '@/lib/ipfs'
import { formatEther } from 'viem'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { getIpfsHash } from '@/lib/ipfs-storage'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function QuizDetailPage({ params }: { params: { id: string } }) {
  const quizId = BigInt(params.id)
  const router = useRouter()
  const { toast } = useToast()
  const { data: quizData, isLoading: isLoadingQuiz, error: quizError } = useGetQuiz(quizId)
  const { data: participantsList, isLoading: isLoadingParticipants } = useGetParticipants(quizId)
  const { address } = useSafeAccount()
  const { data: participantData } = useGetParticipantData(quizId, address as `0x${string}` | undefined)
  const { endQuiz, isPending: isEnding, isConfirming: isConfirmingEnd, isConfirmed: isEndConfirmed } = useEndQuiz()
  const { distributeRewards, isPending: isDistributing, isConfirming: isConfirmingDistribute, isConfirmed: isDistributeConfirmed } = useDistributeRewards()
  const [metadata, setMetadata] = useState<any>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)

  // Share functionality
  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/quiz/${params.id}`
  }

  const getShareText = () => {
    const quizTitle = metadata?.title || `Quiz #${params.id}`
    const prizePool = quizData?.prizePool ? parseFloat(formatEther(quizData.prizePool as bigint)) : 0
    const participantCount = participantsList?.length || 0
    
    let text = `🎯 Check out this quiz: ${quizTitle}`
    if (prizePool > 0) text += `\n💰 Prize Pool: $${prizePool.toFixed(2)}`
    if (participantCount > 0) text += `\n👥 ${participantCount} participants`
    text += `\n\nJoin now: ${getShareUrl()}`
    
    return text
  }

  const handleCopyLink = async () => {
    try {
      const url = getShareUrl()
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      toast({
        title: "Link copied!",
        description: "Quiz link has been copied to your clipboard.",
      })
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getShareUrl())
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    setIsShareMenuOpen(false)
  }

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl())
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    window.open(facebookUrl, '_blank', 'width=550,height=420')
    setIsShareMenuOpen(false)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata?.title || `Quiz #${params.id} - Scholaric`,
          text: getShareText(),
          url: getShareUrl(),
        })
        setIsShareMenuOpen(false)
        toast({
          title: "Shared!",
          description: "Quiz has been shared successfully.",
        })
      } catch (err: any) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
          toast({
            title: "Share failed",
            description: "Could not share. Please try another method.",
            variant: "destructive",
          })
        }
      }
    } else {
      // Fallback to copy link if native share is not available
      handleCopyLink()
    }
  }

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!quizData?.metadataHash) {
        setIsLoadingMetadata(false)
        return
      }

      try {
        // Get IPFS hash from localStorage (stored when quiz was created)
        const ipfsHash = getIpfsHash(params.id)
        
        if (!ipfsHash) {
          console.warn('IPFS hash not found for quiz', params.id, '- using fallback data')
          // Use fallback data if IPFS hash not found
          setIsLoadingMetadata(false)
          return
        }

        // Fetch metadata from IPFS
        const fetchedMetadata = await fetchQuizMetadata(ipfsHash)
        setMetadata(fetchedMetadata)
        setIsLoadingMetadata(false)
      } catch (err: any) {
        console.error('Error fetching metadata:', err)
        // Don't set error, just use fallback data
        setIsLoadingMetadata(false)
      }
    }

    if (quizData) {
      fetchMetadata()
    }
  }, [quizData, params.id])

  // Handle end quiz confirmation
  useEffect(() => {
    if (isEndConfirmed) {
      toast({
        title: "Quiz ended!",
        description: "The quiz has been marked as ended. You can now distribute rewards.",
      })
      // Refresh quiz data
      window.location.reload()
    }
  }, [isEndConfirmed, toast])

  // Handle distribute rewards confirmation
  useEffect(() => {
    if (isDistributeConfirmed) {
      toast({
        title: "Rewards distributed!",
        description: "Rewards have been successfully distributed to all participants.",
      })
      // Refresh quiz data
      window.location.reload()
    }
  }, [isDistributeConfirmed, toast])

  if (isLoadingQuiz || isLoadingMetadata) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading quiz details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (quizError || !quizData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Error loading quiz</p>
            <p className="text-sm text-muted-foreground mt-2">{quizError?.message || 'Quiz not found'}</p>
          </div>
        </main>
      </div>
    )
  }

  // Determine status
  const now = Math.floor(Date.now() / 1000)
  let status: 'live' | 'upcoming' | 'ended' | 'cancelled' = 'upcoming'
  const quizEndedByTime = Number(quizData.endTime) <= now
  const quizStatus = Number(quizData.status) || 0
  
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

  const handleEndQuiz = async () => {
    try {
      endQuiz(quizId)
      toast({
        title: "Ending quiz...",
        description: "Please confirm the transaction in your wallet.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to end quiz",
        variant: "destructive",
      })
    }
  }

  const handleDistributeRewards = async () => {
    try {
      distributeRewards(quizId)
      toast({
        title: "Distributing rewards...",
        description: "Please confirm the transaction in your wallet.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to distribute rewards",
        variant: "destructive",
      })
    }
  }

  const prizePool = parseFloat(formatEther(quizData.prizePool))
  const participantCount = Number(quizData.participantCount)
  const maxParticipants = Number(quizData.maxParticipants)
  const duration = Number(quizData.duration) / 60 // Convert to minutes
  const startTimeDate = new Date(Number(quizData.startTime) * 1000)
  const endTimeDate = new Date(Number(quizData.endTime) * 1000)

  // Use metadata if available, otherwise use fallback
  const title = metadata?.title || `Quiz #${params.id}`
  const description = metadata?.description || "Educational quiz on CeloScholar"
  const difficulty = metadata?.difficulty || "Intermediate"
  const subject = metadata?.subject || "General"
  const grade = metadata?.grade || "9-12"
  const questionsCount = metadata?.questions?.length || 0

  const isParticipant = address && participantsList?.includes(address as `0x${string}`)
  const isCreator = address?.toLowerCase() === quizData.creator.toLowerCase()
  const hasCompleted = participantData?.hasCommitted && participantData?.hasRevealed

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          {difficulty}
                        </Badge>
                    {status === 'live' && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                        Live Now
                      </Badge>
                    )}
                    {status === 'upcoming' && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        Upcoming
                      </Badge>
                    )}
                    {status === 'ended' && (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Ended
                      </Badge>
                    )}
                    {status === 'ended' && (
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        Ended
                      </Badge>
                    )}
                    {status === 'cancelled' && (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Cancelled
                      </Badge>
                    )}
                    {quizData.isVerified && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                    {title}
                  </h1>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Quiz Details */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="font-semibold">{duration} min</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Questions</div>
                          <div className="font-semibold">{questionsCount}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Grade Level</div>
                          <div className="font-semibold">{grade}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Starts</div>
                          <div className="font-semibold text-sm">
                            {startTimeDate.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Ends</div>
                          <div className="font-semibold text-sm">
                            {endTimeDate.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Subject</div>
                          <div className="font-semibold">{subject}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Creator Info */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Creator</h2>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                          {quizData.creator.substring(2, 4).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">Quiz Creator</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {quizData.creator.substring(0, 6)}...{quizData.creator.substring(38)}
                          </div>
                        </div>
                      </div>
                      {isCreator && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          You
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Prize Pool Card */}
                <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Coins className="h-5 w-5" />
                      <span className="text-sm font-medium">Total Prize Pool</span>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      ${prizePool.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      cUSD
                    </div>
                    {status !== 'cancelled' && status !== 'ended' && (
                    <Button className="w-full gap-2" asChild>
                        <Link href={`/quiz/${params.id}/fund`}>
                        <Coins className="h-4 w-4" />
                        Fund Quiz
                      </Link>
                    </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card className="border-border">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Participants</span>
                      <span className="text-sm text-muted-foreground">
                        {participantCount}/{maxParticipants > 1000000n ? '∞' : maxParticipants.toString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ 
                          width: `${maxParticipants > 1000000n ? 0 : Math.min((participantCount / Number(maxParticipants)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    {isCreator ? (
                      // Creator actions
                      <div className="space-y-2">
                        {quizEndedByTime && quizStatus !== 2 ? (
                          <Button 
                            className="w-full gap-2" 
                            size="lg"
                            onClick={handleEndQuiz}
                            disabled={isEnding || isConfirmingEnd}
                          >
                            {isEnding || isConfirmingEnd ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ending Quiz...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                End Quiz
                              </>
                            )}
                          </Button>
                        ) : status === 'ended' && quizData.prizePool > 0n ? (
                          <Button 
                            className="w-full gap-2" 
                            size="lg"
                            onClick={handleDistributeRewards}
                            disabled={isDistributing || isConfirmingDistribute}
                          >
                            {isDistributing || isConfirmingDistribute ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Distributing...
                              </>
                            ) : (
                              <>
                                <Coins className="h-4 w-4" />
                                Distribute Rewards
                              </>
                            )}
                          </Button>
                        ) : null}
                        {status === 'ended' ? (
                          <Button className="w-full gap-2" size="lg" variant="outline" asChild>
                            <Link href={`/quiz/${params.id}/results`}>
                              <TrendingUp className="h-4 w-4" />
                              View All Results
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    ) : isParticipant && hasCompleted ? (
                      <Button className="w-full gap-2" size="lg" asChild>
                        <Link href={`/quiz/${params.id}/results`}>
                          <TrendingUp className="h-4 w-4" />
                          View My Results
                        </Link>
                      </Button>
                    ) : isParticipant && participantData?.hasCommitted && (status === 'ended' || quizEndedByTime) ? (
                      <Button className="w-full gap-2" size="lg" asChild>
                        <Link href={`/quiz/${params.id}/results`}>
                          <TrendingUp className="h-4 w-4" />
                          View Results
                        </Link>
                      </Button>
                    ) : isParticipant ? (
                      <Button className="w-full gap-2" size="lg" asChild>
                        <Link href={`/quiz/${params.id}/session`}>
                          <Play className="h-4 w-4" />
                          Continue Quiz
                        </Link>
                      </Button>
                    ) : isCreator && quizEndedByTime && quizStatus !== 2 ? (
                      <Button 
                        className="w-full gap-2" 
                        size="lg" 
                        asChild 
                        disabled={maxParticipants <= 1000000n && participantCount >= Number(maxParticipants)}
                      >
                        <Link href={`/quiz/${params.id}/join`}>
                        <Play className="h-4 w-4" />
                          {maxParticipants <= 1000000n && participantCount >= Number(maxParticipants) ? 'Full' : 'Join Quiz'}
                        </Link>
                      </Button>
                    ) : status === 'ended' ? (
                      <Button className="w-full gap-2" size="lg" asChild>
                        <Link href={`/quiz/${params.id}/results`}>
                          <TrendingUp className="h-4 w-4" />
                          View Results
                      </Link>
                    </Button>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border-border">
                  <CardContent className="p-6 space-y-3">
                    <DropdownMenu open={isShareMenuOpen} onOpenChange={setIsShareMenuOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full gap-2" size="sm">
                          <Share2 className="h-4 w-4" />
                          Share Quiz
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {navigator.share && (
                          <>
                            <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
                              <Share2 className="h-4 w-4 mr-2" />
                              Share via...
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                          {linkCopied ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              Link Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShareTwitter} className="cursor-pointer">
                          <Twitter className="h-4 w-4 mr-2" />
                          Share on Twitter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer">
                          <Facebook className="h-4 w-4 mr-2" />
                          Share on Facebook
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" className="w-full gap-2 text-muted-foreground" size="sm">
                      <Flag className="h-4 w-4" />
                      Report Issue
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
