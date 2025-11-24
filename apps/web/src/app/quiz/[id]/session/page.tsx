'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Clock, ChevronRight, Flag, Loader2, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGetQuiz, useGetParticipantData, useCommitAnswer, useRevealAnswer } from '@/hooks/useQuizContract'
import { fetchQuizMetadata, type QuizMetadata } from '@/lib/ipfs'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { calculateCommitment, hashCorrectAnswers } from '@/hooks/useQuizContract'
import { keccak256 } from 'viem'
import { useToast } from '@/hooks/use-toast'
import { randomBytes } from 'crypto'
import { getIpfsHash, setIpfsHashManually } from '@/lib/ipfs-storage'
import { usePublicClient } from 'wagmi'

export default function QuizSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const quizId = BigInt(params.id)
  const { data: quizData, isLoading: isLoadingQuiz } = useGetQuiz(quizId)
  const { address } = useSafeAccount()
  const { data: participantData } = useGetParticipantData(quizId, address as `0x${string}` | undefined)
  const { commitAnswer, isPending: isCommitting, isConfirming: isConfirmingCommit, isConfirmed: isCommitConfirmed } = useCommitAnswer()
  const { revealAnswer, isPending: isRevealing, isConfirming: isConfirmingReveal, isConfirmed: isRevealConfirmed } = useRevealAnswer()
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [metadata, setMetadata] = useState<QuizMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [salt, setSalt] = useState<`0x${string}` | null>(null)
  const [hasCommitted, setHasCommitted] = useState(false)
  const [hasRevealed, setHasRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualIpfsHash, setManualIpfsHash] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const publicClient = usePublicClient()

  // Initialize salt and check participant status
  useEffect(() => {
    if (!address) return
    
    // Generate salt if not exists
    if (!salt) {
      const saltBytes = randomBytes(32)
      const newSalt = `0x${Buffer.from(saltBytes).toString('hex')}` as `0x${string}`
      setSalt(newSalt)
    }

    // Check if already committed/revealed
    if (participantData) {
      setHasCommitted(participantData.hasCommitted)
      setHasRevealed(participantData.hasRevealed)
    }
  }, [address, participantData, salt])

  // Fetch quiz metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!quizData?.metadataHash) {
        setIsLoadingMetadata(false)
        return
      }

      try {
        // Get IPFS hash from localStorage (stored when quiz was created)
        let ipfsHash = getIpfsHash(quizId.toString())
        
        if (!ipfsHash) {
          console.warn('IPFS hash not found in localStorage for quiz', quizId.toString())
          
          // Try to auto-recover from Pinata by matching metadataHash
          console.log('Attempting to auto-recover IPFS hash from Pinata...')
          try {
            const { findIpfsHashByMetadataHash } = await import('@/lib/ipfs')
            const recoveredHash = await findIpfsHashByMetadataHash(
              quizData.metadataHash as `0x${string}`,
              quizData.creator as `0x${string}`
            )
            
            if (recoveredHash) {
              console.log('Successfully recovered IPFS hash:', recoveredHash)
              // Store it for future use
              const { setIpfsHashManually } = await import('@/lib/ipfs-storage')
              setIpfsHashManually(quizId.toString(), recoveredHash)
              ipfsHash = recoveredHash
            } else {
              console.warn('Could not auto-recover IPFS hash from Pinata')
              // Show manual input option
              setShowManualInput(true)
              setIsLoadingMetadata(false)
              return
            }
          } catch (recoveryError) {
            console.error('Error during IPFS hash recovery:', recoveryError)
            // Show manual input option
            setShowManualInput(true)
            setIsLoadingMetadata(false)
            return
          }
        }

        // Fetch metadata from IPFS
        const fetchedMetadata = await fetchQuizMetadata(ipfsHash)
        setMetadata(fetchedMetadata)
        setShowManualInput(false)
        setIsLoadingMetadata(false)
      } catch (err: any) {
        console.error('Error fetching metadata:', err)
        setError(err.message || 'Failed to load quiz metadata')
        setShowManualInput(true)
        setIsLoadingMetadata(false)
      }
    }

    if (quizData) {
      fetchMetadata()
    }
  }, [quizData, quizId])

  // Handle manual IPFS hash input
  const handleManualIpfsHash = async () => {
    if (!manualIpfsHash.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid IPFS hash",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoadingMetadata(true)
      setError(null)
      
      // Fetch metadata from IPFS
      const fetchedMetadata = await fetchQuizMetadata(manualIpfsHash.trim())
      setMetadata(fetchedMetadata)
      
      // Store it for future use
      setIpfsHashManually(quizId.toString(), manualIpfsHash.trim())
      
      setShowManualInput(false)
      setManualIpfsHash('')
      setIsLoadingMetadata(false)
      
      toast({
        title: "Metadata loaded",
        description: "Quiz metadata has been successfully loaded.",
      })
    } catch (err: any) {
      console.error('Error fetching metadata with manual hash:', err)
      setError(err.message || 'Failed to load quiz metadata from provided IPFS hash')
      setIsLoadingMetadata(false)
      toast({
        title: "Failed to load metadata",
        description: "The provided IPFS hash is invalid or the metadata is not accessible.",
        variant: "destructive",
      })
    }
  }

  // Initialize time left and answers array
  useEffect(() => {
    if (quizData && metadata) {
      const now = Math.floor(Date.now() / 1000)
      const endTime = Number(quizData.endTime)
      const remaining = Math.max(0, endTime - now)
      setTimeLeft(remaining)
      
      // Initialize answers array
      if (answers.length === 0 && metadata.questions) {
        setAnswers(new Array(metadata.questions.length).fill(null))
      }
    }
  }, [quizData, metadata])

  const questions = metadata?.questions || []

  // Define handleSubmit before it's used in useEffect
  const handleSubmit = useCallback(async () => {
    if (hasCommitted) {
      // Already committed, just navigate
      router.push(`/quiz/${params.id}/results`)
      return
    }

    if (!salt || answers.some(a => a === null)) {
      toast({
        title: "Incomplete answers",
        description: "Please answer all questions before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      // Store answers and salt in localStorage for later reveal
      // Use lowercase address to ensure consistency across different address formats
      const storageKey = `quiz_${params.id}_answers_${address?.toLowerCase()}`
      const saltKey = `quiz_${params.id}_salt_${address?.toLowerCase()}`
      
      localStorage.setItem(storageKey, JSON.stringify(answers))
      localStorage.setItem(saltKey, String(salt || ''))
      
      console.log('Stored answers and salt for reveal:', { 
        storageKey, 
        saltKey, 
        quizId: params.id,
        address: address?.toLowerCase(),
        answersCount: answers.length 
      })
      
      // Convert answers to bytes using TextEncoder (consistent with reveal phase)
      const answersJsonString = JSON.stringify(answers)
      const textEncoder = new TextEncoder()
      const answersBytes = textEncoder.encode(answersJsonString)
      
      console.log('🔍 Debug commitment during commit:', {
        answers,
        answersJsonString,
        answersBytesLength: answersBytes.length,
        answersBytesArray: Array.from(answersBytes),
        salt,
        saltLength: salt.length
      })
      
      // Create commitment
      const commitment = calculateCommitment(answersBytes, salt)
      
      console.log('✅ Commitment created:', commitment)
      
      // Commit answer
      toast({
        title: "Committing answers...",
        description: "Please confirm the transaction in your wallet.",
      })
      
      await commitAnswer(quizId, commitment)
    } catch (err: any) {
      console.error('Error committing answers:', err)
      toast({
        title: "Error",
        description: err.message || "Failed to commit answers",
        variant: "destructive",
      })
    }
  }, [hasCommitted, salt, answers, toast, router, params.id, commitAnswer, quizId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || hasRevealed) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, hasRevealed, handleSubmit])

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedAnswer
      setAnswers(newAnswers)
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[currentQuestion + 1])
    } else {
      handleSubmit()
    }
  }

  // Handle commit confirmation - ensure data is stored in localStorage
  useEffect(() => {
    if (isCommitConfirmed && !hasCommitted) {
      setHasCommitted(true)
      
      // CRITICAL: Re-store answers and salt in localStorage after commit confirmation
      // This ensures data persists even if localStorage was cleared during the commit process
      if (salt && answers.length > 0 && address) {
        const storageKey = `quiz_${params.id}_answers_${address.toLowerCase()}`
        const saltKey = `quiz_${params.id}_salt_${address.toLowerCase()}`
        
        // Store in localStorage
                localStorage.setItem(storageKey, JSON.stringify(answers))
                localStorage.setItem(saltKey, String(salt))
        
        // Also store in sessionStorage as backup
                sessionStorage.setItem(storageKey, JSON.stringify(answers))
                sessionStorage.setItem(saltKey, String(salt))
        
        console.log('✅ Re-stored answers and salt after commit confirmation:', {
          storageKey,
          saltKey,
          quizId: params.id,
          address: address.toLowerCase(),
          answersCount: answers.length,
          hasSalt: !!salt
        })
      }
      
      toast({
        title: "Answers committed!",
        description: "Your answers have been committed to the blockchain.",
      })
      // Navigate to results after commit
      setTimeout(() => {
        router.push(`/quiz/${params.id}/results`)
      }, 2000)
    }
  }, [isCommitConfirmed, hasCommitted, router, params.id, toast, salt, answers, address])

  // Auto-reveal if quiz has ended and not yet revealed
  useEffect(() => {
    if (!quizData || !metadata || !salt || hasRevealed || !hasCommitted || !address) return

    const checkAndReveal = async () => {
      const now = Math.floor(Date.now() / 1000)
      const quizEnded = Number(quizData.endTime) <= now || Number(quizData.status) === 2
      if (!quizEnded) return // Quiz hasn't ended yet

      try {
        // Calculate correct answers - ensure they're numbers
        const correctAnswers = metadata.questions.map((q: any) => {
          const answer = q.correctAnswer
          return typeof answer === 'string' ? parseInt(answer, 10) : answer
        })
        
        // Ensure answers are numbers
        const numericAnswers = answers.map((a: any) => typeof a === 'string' ? parseInt(a, 10) : a)

        // Calculate score
        let score = 0
        for (let i = 0; i < numericAnswers.length; i++) {
          if (numericAnswers[i] === correctAnswers[i]) {
            score++
          }
        }

        // Convert to JSON strings and then to bytes using TextEncoder
        // This ensures consistency with the commit phase
        const answersJsonString = JSON.stringify(numericAnswers)
        const correctAnswersJsonString = JSON.stringify(correctAnswers)
        const textEncoder = new TextEncoder()
        const answersBytes = textEncoder.encode(answersJsonString)
        const correctAnswersBytes = textEncoder.encode(correctAnswersJsonString)

        // Reveal answer (answersBytes and correctAnswersBytes are already Uint8Array)
        await revealAnswer(
          quizId,
          answersBytes,
          salt,
          correctAnswersBytes,
          BigInt(score)
        )
      } catch (err: any) {
        console.error('Error revealing answers:', err)
      }
    }

    // Check immediately
    checkAndReveal()

    // Set up interval to check every 5 seconds if quiz has ended
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const quizEnded = Number(quizData.endTime) <= now || Number(quizData.status) === 2
      if (quizEnded) {
        checkAndReveal()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [quizData, metadata, salt, hasRevealed, hasCommitted, address, answers, quizId, revealAnswer])

  // Handle reveal confirmation
  useEffect(() => {
    if (isRevealConfirmed && !hasRevealed) {
      setHasRevealed(true)
      toast({
        title: "Answers revealed!",
        description: "Your answers have been revealed and scored. Redirecting to results...",
      })
      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/quiz/${params.id}/results`)
      }, 2000)
    }
  }, [isRevealConfirmed, hasRevealed, toast, router, params.id])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoadingQuiz || isLoadingMetadata) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading quiz session...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show manual IPFS hash input if metadata not found
  if (showManualInput && !metadata && quizData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-warning" />
                <h2 className="text-xl font-semibold mb-2">Quiz Metadata Not Found</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This quiz was created before IPFS storage mapping was implemented. 
                  Please enter the IPFS hash to load the quiz metadata.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ipfs-hash">IPFS Hash</Label>
                <Input
                  id="ipfs-hash"
                  placeholder="Qm..."
                  value={manualIpfsHash}
                  onChange={(e) => setManualIpfsHash(e.target.value)}
                  disabled={isLoadingMetadata}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the IPFS hash (CID) for this quiz's metadata
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleManualIpfsHash}
                  disabled={isLoadingMetadata || !manualIpfsHash.trim()}
                  className="flex-1"
                >
                  {isLoadingMetadata ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load Metadata'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/quiz/${params.id}`)}
                  disabled={isLoadingMetadata}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (error || !quizData || !metadata) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Error loading quiz</p>
            <p className="text-sm text-muted-foreground mt-2">{error || 'Quiz not found'}</p>
          </div>
        </main>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-warning" />
            <p className="font-medium">No questions available</p>
            <p className="text-sm text-muted-foreground mt-2">This quiz has no questions yet.</p>
          </div>
        </main>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Quiz Header */}
      <div className="border-b border-border bg-muted/30 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-warning" />
              <span className={timeLeft < 300 ? 'text-warning' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-border">
            <CardContent className="p-8 space-y-8">
              {/* Question */}
              <div>
                <h2 className="text-2xl font-bold mb-6 leading-tight">
                  {currentQ.questionText}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(index)}
                      disabled={hasCommitted || hasRevealed}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 bg-card'
                      } ${hasCommitted || hasRevealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selectedAnswer === index
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {selectedAnswer === index && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Messages */}
              {hasCommitted && !hasRevealed && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-500">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Answers committed! Waiting for quiz to end...</span>
                  </div>
                  {/* Show results button if quiz has ended, even if not revealed yet */}
                  {quizData && Number(quizData.endTime) <= Math.floor(Date.now() / 1000) && (
                    <Button
                      className="w-full gap-2"
                      variant="outline"
                      onClick={() => router.push(`/quiz/${params.id}/results`)}
                    >
                      <TrendingUp className="h-4 w-4" />
                      View Results (Quiz Ended)
                    </Button>
                  )}
                </div>
              )}

              {hasRevealed && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Answers revealed! Your results are ready.</span>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => router.push(`/quiz/${params.id}/results`)}
                  >
                    <TrendingUp className="h-4 w-4" />
                    View Results
                  </Button>
                </div>
              )}

              {/* Navigation */}
              {!hasRevealed && (
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleSubmit}
                    disabled={hasCommitted || hasRevealed || isCommitting || isConfirmingCommit}
                >
                  <Flag className="h-4 w-4" />
                    {hasCommitted ? 'Committed' : 'Submit Early'}
                </Button>
                <Button
                  onClick={handleNext}
                    disabled={selectedAnswer === null || hasCommitted || hasRevealed || isCommitting || isConfirmingCommit}
                  className="gap-2"
                >
                    {(isCommitting || isConfirmingCommit) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isCommitting ? 'Committing...' : 'Confirming...'}
                      </>
                    ) : (
                      <>
                  {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                </Button>
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
