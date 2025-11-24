'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock, BookOpen, Coins, AlertCircle, Play, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useJoinQuiz, useGetQuiz } from '@/hooks/useQuizContract'
import { formatEther } from 'viem'
import { useToast } from '@/hooks/use-toast'

export default function JoinQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { toast } = useToast()
  const quizId = BigInt(params.id)
  const { data: quizData, isLoading: isLoadingQuiz } = useGetQuiz(quizId)
  const { joinQuiz, isPending, isConfirming, isConfirmed, error } = useJoinQuiz()

  const handleJoinQuiz = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms before joining",
        variant: "destructive",
      })
      return
    }

    try {
      toast({
        title: "Joining quiz...",
        description: "Please confirm the transaction in your wallet.",
      })
      await joinQuiz(quizId)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to join quiz",
        variant: "destructive",
      })
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Success!",
        description: "You've successfully joined the quiz!",
      })
    setTimeout(() => {
        router.push(`/quiz/${params.id}/session`)
    }, 1500)
  }
  }, [isConfirmed, router, params.id, toast])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to join quiz",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const duration = quizData ? Number(quizData.duration) / 60 : 0
  const prizePool = quizData ? parseFloat(formatEther(quizData.prizePool)) : 0

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-border">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Ready to Join?</h1>
                <p className="text-muted-foreground">
                  Review the quiz details before starting
                </p>
              </div>

              {/* Quiz Info */}
              {isLoadingQuiz ? (
                <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </div>
              ) : (
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Quiz #{params.id}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">${prizePool.toFixed(2)} Prize Pool</span>
                  </div>
                  </div>
                </div>
              )}

              {/* Important Information */}
              <Card className="border-warning/50 bg-warning/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Important Information</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>You cannot pause or restart the quiz once started</li>
                        <li>Your answers will be submitted automatically when time expires</li>
                        <li>You must complete all questions to be eligible for rewards</li>
                        <li>Results will be finalized after the quiz ends</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  I understand the rules and agree to participate fairly. I acknowledge that
                  my answers will be verified on the blockchain and rewards will be distributed
                  based on performance.
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isPending || isConfirming}
                >
                  Go Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleJoinQuiz}
                  disabled={!agreedToTerms || isPending || isConfirming || isConfirmed || isLoadingQuiz}
                >
                  {(isPending || isConfirming) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isPending ? 'Waiting for wallet...' : 'Confirming...'}
                    </>
                  ) : isConfirmed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Joined!
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
