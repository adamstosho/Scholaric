'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { QuestionBuilder } from '@/components/question-builder'
import { Save, Plus, Eye, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { useRouter } from 'next/navigation'
import { useCreateQuiz, hashCorrectAnswers } from '@/hooks/useQuizContract'
import { uploadQuizMetadata, type QuizMetadata } from '@/lib/ipfs'
import { keccak256, stringToBytes, decodeEventLog } from 'viem'
import { useToast } from '@/hooks/use-toast'
import { useChainId, usePublicClient } from 'wagmi'
import { CHAIN_ID } from '@/lib/contracts/addresses'
import { storeIpfsHash } from '@/lib/ipfs-storage'
import quizManagerAbi from '@/lib/contracts/quiz-manager-abi.json'

interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  questionText: string
  options?: string[]
  correctAnswer: string | number
}

export default function CreateQuizPage() {
  const { isConnected, address } = useSafeAccount()
  const chainId = useChainId()
  const router = useRouter()
  const publicClient = usePublicClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [grade, setGrade] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [prizePool, setPrizePool] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [pendingIpfsHash, setPendingIpfsHash] = useState<string | null>(null)
  const { toast } = useToast()
  const { createQuiz, isPending, isConfirming, isConfirmed, error, hash } = useCreateQuiz()

  // Redirect to landing page if wallet is not connected
  useEffect(() => {
    if (!isConnected || !address) {
      const timer = setTimeout(() => {
        router.replace('/')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected, address, router])

  // Handle transaction hash (when wallet approves)
  useEffect(() => {
    if (hash && isPublishing && !publishError) {
      toast({
        title: "Transaction submitted",
        description: "Waiting for blockchain confirmation...",
      })
    }
  }, [hash, isPublishing, publishError, toast])

  // Handle transaction confirmation
  useEffect(() => {
    const extractQuizIdAndStoreIpfsHash = async () => {
      if (isConfirmed && hash && pendingIpfsHash && publicClient && !publishSuccess && isPublishing) {
        try {
          // Get transaction receipt
          const receipt = await publicClient.getTransactionReceipt({ hash })
          
          // Find QuizCreated event in logs
          const quizCreatedEvent = receipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({
                abi: quizManagerAbi,
                data: log.data,
                topics: log.topics,
              })
              return decoded.eventName === 'QuizCreated'
            } catch {
              return false
            }
          })
          
          if (quizCreatedEvent) {
            const decoded = decodeEventLog({
              abi: quizManagerAbi,
              data: quizCreatedEvent.data,
              topics: quizCreatedEvent.topics,
            })
            
            if (decoded.eventName === 'QuizCreated') {
              const quizId = decoded.args.quizId as bigint
              
              // Store IPFS hash mapping
              storeIpfsHash(quizId.toString(), pendingIpfsHash)
              console.log(`Stored IPFS hash for quiz ${quizId}: ${pendingIpfsHash}`)
              
              setPublishSuccess(true)
              setIsPublishing(false)
              setPendingIpfsHash(null)
              toast({
                title: "Quiz created!",
                description: "Your quiz has been successfully created on-chain.",
              })
              // Redirect to catalogue after a short delay
              setTimeout(() => {
                router.push('/catalogue')
              }, 2000)
            }
          } else {
            console.error('QuizCreated event not found in transaction receipt')
            // Still mark as success, but log the error
            setPublishSuccess(true)
            setIsPublishing(false)
            toast({
              title: "Quiz created!",
              description: "Your quiz has been successfully created on-chain.",
            })
            setTimeout(() => {
              router.push('/catalogue')
            }, 2000)
          }
        } catch (err) {
          console.error('Error extracting quizId from receipt:', err)
          // Still mark as success, but log the error
          setPublishSuccess(true)
          setIsPublishing(false)
          toast({
            title: "Quiz created!",
            description: "Your quiz has been successfully created on-chain.",
          })
          setTimeout(() => {
            router.push('/catalogue')
          }, 2000)
        }
      }
    }
    
    extractQuizIdAndStoreIpfsHash()
  }, [isConfirmed, hash, pendingIpfsHash, publicClient, publishSuccess, isPublishing, toast, router])

  // Handle transaction errors
  useEffect(() => {
    if (error && isPublishing && !publishError) {
      let errorMessage = 'Transaction failed. Please try again.'
      
      // Extract error message from wagmi error object
      const errorMsg = error.message || error.shortMessage || error.cause?.message || String(error)
      
      // Log full error for debugging
      console.error('Full error object:', error)
      console.error('Error message:', errorMsg)
      
      // Check for specific error types
      if (errorMsg.includes('RPC') || errorMsg.includes('endpoint') || errorMsg.includes('too many errors') || errorMsg.includes('Requested resource not available')) {
        errorMessage = 'Network error: The blockchain network is temporarily unavailable. Please try again in a few moments or refresh the page.'
      } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('balance')) {
        errorMessage = 'Insufficient funds: You need more CELO to create a quiz. Please add funds to your wallet.'
      } else if (errorMsg.includes('user rejected') || errorMsg.includes('denied') || errorMsg.includes('User rejected') || errorMsg.includes('User rejected the request')) {
        errorMessage = 'Transaction cancelled: You rejected the transaction in your wallet.'
      } else if (errorMsg.includes('Chain mismatch') || errorMsg.includes('chain') || errorMsg.includes('Unsupported chain')) {
        const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME || 'Celo Mainnet';
        errorMessage = `Wrong network: Please switch to ${networkName} (Chain ID: ${CHAIN_ID}) in your wallet.`
      } else if (errorMsg.includes('connector') || errorMsg.includes('not connected') || errorMsg.includes('No connector')) {
        errorMessage = 'Wallet not connected: Please connect your wallet and try again.'
      } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
        // Only show generic network error if it's not one of the specific cases above
        errorMessage = `Network error: ${errorMsg}. Please check your connection and try again.`
      } else {
        // Show the actual error message for debugging
        errorMessage = errorMsg || 'Unknown error occurred. Please check the console for details.'
      }
      
      setPublishError(errorMessage)
      setIsPublishing(false)
      toast({
        title: "Transaction failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [error, isPublishing, publishError, toast])

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

  const handleAddQuestion = (question: Question) => {
    setQuestions([...questions, question])
    setShowQuestionBuilder(false)
  }

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSaveDraft = () => {
    // Save to localStorage as draft
    const draft = {
      title,
      description,
      subject,
      difficulty,
      grade,
      startTime,
      duration,
      maxParticipants,
      prizePool,
      questions,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('quiz-draft', JSON.stringify(draft))
    toast({
      title: "Draft saved",
      description: "Your quiz has been saved as a draft.",
    })
  }

  const handlePublishQuiz = async () => {
    if (!title || !description || questions.length === 0 || !startTime || !duration) {
      setPublishError('Please fill in all required fields and add at least one question.')
      return
    }

    if (!address) {
      setPublishError('Wallet not connected.')
      return
    }

    setIsPublishing(true)
    setPublishError(null)
    setPublishSuccess(false)

    try {
      // Validate start time
      const startTimeDate = new Date(startTime)
      const now = new Date()
      if (startTimeDate <= now) {
        throw new Error('Start time must be in the future')
      }

      // Validate duration
      const durationSeconds = parseInt(duration) * 60
      if (durationSeconds <= 0) {
        throw new Error('Duration must be greater than 0')
      }

      // Validate max participants
      const maxParticipantsValue = maxParticipants ? BigInt(maxParticipants) : BigInt(2**256 - 1) // Max uint256
      if (maxParticipantsValue <= 0n) {
        throw new Error('Max participants must be greater than 0')
      }

      // Step 1: Prepare metadata
      const metadata: QuizMetadata = {
        title,
        description,
        subject,
        difficulty,
        grade,
        questions,
        createdAt: new Date().toISOString(),
        creator: address,
      }

      // Step 2: Upload metadata to IPFS
      toast({
        title: "Uploading to IPFS...",
        description: "Please wait while we upload your quiz metadata.",
      })

      const ipfsHash = await uploadQuizMetadata(metadata)
      console.log('IPFS Hash:', ipfsHash)
      
      // Store IPFS hash temporarily (will be stored with quizId after confirmation)
      setPendingIpfsHash(ipfsHash)

      // Convert IPFS hash (Qm...) to bytes32 format
      // IPFS hash is base58 encoded, we need to convert it to bytes32
      // For now, we'll use keccak256 of the IPFS hash string as bytes32
      const ipfsHashBytes = stringToBytes(ipfsHash)
      const metadataHash = keccak256(ipfsHashBytes) as `0x${string}`

      // Step 3: Calculate correct answers hash
      const correctAnswersString = JSON.stringify(questions.map(q => q.correctAnswer))
      const correctAnswersHash = keccak256(stringToBytes(correctAnswersString)) as `0x${string}`

      // Step 4: Prepare contract parameters
      const startTimeUnix = BigInt(Math.floor(startTimeDate.getTime() / 1000))
      const durationBigInt = BigInt(durationSeconds)

      // Step 5: Verify wallet connection and network before proceeding
      if (!address || !isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet and try again.')
      }

      // Check if on correct network
      if (chainId !== CHAIN_ID) {
        const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME || 'Celo Mainnet';
        throw new Error(`Wrong network. Please switch to ${networkName} (Chain ID: ${CHAIN_ID}) in your wallet. Current chain: ${chainId}`)
      }

      // Step 6: Call createQuiz contract function
      toast({
        title: "Creating quiz on-chain...",
        description: "Please confirm the transaction in your wallet.",
      })

      try {
        // writeContract doesn't return a promise, it triggers the wallet prompt
        // Errors will be caught synchronously if validation fails
        console.log('Calling createQuiz with:', {
          metadataHash,
          maxParticipants: maxParticipantsValue.toString(),
          startTime: startTimeUnix.toString(),
          duration: durationBigInt.toString(),
          correctAnswersHash,
          chainId,
          address
        })
        
        createQuiz(
          metadataHash,
          maxParticipantsValue,
          startTimeUnix,
          durationBigInt,
          correctAnswersHash
        )
        
        // Transaction is now pending - wait for hash, then confirmation
        // The useEffect hooks will handle the rest
      } catch (err: any) {
        // Handle synchronous validation errors
        if (err?.message?.includes('RPC') || err?.message?.includes('endpoint') || err?.message?.includes('too many errors')) {
          throw new Error(
            'Network error: RPC endpoint is temporarily unavailable. ' +
            'Please try again in a few moments. If the problem persists, ' +
            'try refreshing the page or switching networks.'
          )
        }
        // Re-throw other errors
        throw err
      }

      // Don't set isPublishing to false here - wait for confirmation or error
      // The useEffect hooks will handle success/error states
      
    } catch (err: any) {
      console.error('Error publishing quiz:', err)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to publish quiz. Please try again.'
      
      if (err?.message?.includes('RPC') || err?.message?.includes('endpoint') || err?.message?.includes('too many errors')) {
        errorMessage = 'Network error: The blockchain network is temporarily unavailable. Please try again in a few moments or refresh the page.'
      } else if (err?.message?.includes('insufficient funds') || err?.message?.includes('balance')) {
        errorMessage = 'Insufficient funds: You need more CELO to create a quiz. Please add funds to your wallet.'
      } else if (err?.message?.includes('user rejected') || err?.message?.includes('denied')) {
        errorMessage = 'Transaction cancelled: You rejected the transaction in your wallet.'
      } else if (err?.message?.includes('network') || err?.message?.includes('Network')) {
        errorMessage = 'Network error: Please check your connection and try again.'
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setPublishError(errorMessage)
      setIsPublishing(false)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Create New Quiz</h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Design an educational quiz with custom questions and prize pool. Engage learners and reward knowledge.
            </p>
          </div>
        </section>

        {/* Quiz Form */}
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="space-y-4 sm:space-y-6 animate-fade-in-delay-1">
              {/* Basic Information */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter quiz title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your quiz..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                          <SelectItem value="languages">Languages</SelectItem>
                          <SelectItem value="literature">Literature</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade Level *</Label>
                      <Select value={grade} onValueChange={setGrade}>
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6-8">6-8</SelectItem>
                          <SelectItem value="7-9">7-9</SelectItem>
                          <SelectItem value="9-11">9-11</SelectItem>
                          <SelectItem value="9-12">9-12</SelectItem>
                          <SelectItem value="10-12">10-12</SelectItem>
                          <SelectItem value="11-12">11-12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time *</Label>
                      <Input
                        id="start-time"
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="30"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-participants">Max Participants (Optional)</Label>
                    <Input
                      id="max-participants"
                      type="number"
                      placeholder="100"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for unlimited participants
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Questions ({questions.length})</CardTitle>
                    <Button
                      onClick={() => setShowQuestionBuilder(true)}
                      className="gap-2"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No questions added yet.</p>
                      <p className="text-sm mt-2">Click "Add Question" to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={question.id} className="border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">Question {index + 1}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({question.type.replace('-', ' ')})
                                  </span>
                                </div>
                                <p className="text-sm">{question.questionText}</p>
                                {question.options && (
                                  <div className="mt-2 space-y-1">
                                    {question.options.map((option, i) => (
                                      <div
                                        key={i}
                                        className={`text-xs ${
                                          i === question.correctAnswer
                                            ? 'text-primary font-medium'
                                            : 'text-muted-foreground'
                                        }`}
                                      >
                                        {option}
                                        {i === question.correctAnswer && ' ✓'}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveQuestion(question.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                Remove
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prize Pool */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Prize Pool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prize-pool">Initial Prize Pool (cUSD) (Optional)</Label>
                    <Input
                      id="prize-pool"
                      type="number"
                      placeholder="50"
                      value={prizePool}
                      onChange={(e) => setPrizePool(e.target.value)}
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      You can add an initial prize pool or let others fund it later
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {publishError && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Error</p>
                        <p className="text-sm text-destructive/80 mt-1">{publishError}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPublishError(null)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Success Message */}
              {publishSuccess && (
                <Card className="border-green-500 bg-green-500/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-500">Success!</p>
                        <p className="text-sm text-green-500/80 mt-1">
                          Your quiz has been created successfully. Redirecting...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pb-8">
                <Button
                  variant="outline"
                  className="gap-2 flex-1 btn-press"
                  onClick={handleSaveDraft}
                  disabled={isPublishing || isPending || isConfirming}
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  className="gap-2 flex-1 btn-press"
                  onClick={handlePublishQuiz}
                  disabled={
                    !title || 
                    !description || 
                    !subject ||
                    !difficulty ||
                    !grade ||
                    !startTime ||
                    !duration ||
                    questions.length === 0 ||
                    isPublishing ||
                    isPending ||
                    isConfirming ||
                    publishSuccess
                  }
                >
                  {(isPublishing || isPending || isConfirming) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isPublishing ? 'Uploading...' : isPending ? 'Waiting for wallet...' : 'Confirming...'}
                    </>
                  ) : (
                    <>
                  <Eye className="h-4 w-4" />
                  Publish Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Question Builder Modal */}
        {showQuestionBuilder && (
          <QuestionBuilder
            onAdd={handleAddQuestion}
            onCancel={() => setShowQuestionBuilder(false)}
          />
        )}
      </main>
    </div>
  )
}

