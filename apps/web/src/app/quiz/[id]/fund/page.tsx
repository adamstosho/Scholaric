'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Coins, TrendingUp, Users, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFundQuiz } from '@/hooks/useQuizContract'
import { useGetQuiz } from '@/hooks/useQuizContract'
import { formatEther } from 'viem'
import { useToast } from '@/hooks/use-toast'

export default function FundQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const { toast } = useToast()
  const quizId = BigInt(params.id)
  const { data: quizData, isLoading: isLoadingQuiz } = useGetQuiz(quizId)
  const { fundQuiz, isPending, isConfirming, isConfirmed, error } = useFundQuiz()

  const handleFund = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
      return
    }

    if (parseFloat(amount) < 1) {
      toast({
        title: "Amount too low",
        description: "Minimum funding amount is 1.00 cUSD",
        variant: "destructive",
      })
      return
    }

    try {
      toast({
        title: "Funding quiz...",
        description: "Please confirm the transaction in your wallet.",
      })
      await fundQuiz(quizId, amount)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to fund quiz",
        variant: "destructive",
      })
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Success!",
        description: `Successfully funded ${amount} cUSD!`,
      })
    setTimeout(() => {
        router.push(`/quiz/${params.id}`)
    }, 2000)
  }
  }, [isConfirmed, amount, router, params.id, toast])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to fund quiz",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const currentPrizePool = quizData ? parseFloat(formatEther(quizData.prizePool)) : 0
  const participants = quizData ? Number(quizData.participantCount) : 0
  const newTotal = currentPrizePool + (parseFloat(amount) || 0)
  const isLoading = isLoadingQuiz

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-border">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold">Fund Quiz</h1>
                <p className="text-muted-foreground">
                  Support learners by adding to the prize pool
                </p>
              </div>

              {/* Quiz Info */}
              {isLoading ? (
                <Card className="border-border bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
              <Card className="border-border bg-muted/30">
                <CardContent className="p-4 space-y-3">
                    <h2 className="font-semibold">Quiz #{params.id}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Current Prize Pool</div>
                      <div className="font-bold text-lg text-primary">
                          ${currentPrizePool.toFixed(2)} cUSD
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Participants</div>
                        <div className="font-bold text-lg">{participants}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Funding Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Funding Amount (cUSD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="10.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: 1.00 cUSD
                  </p>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount('5')}
                    className="flex-1"
                  >
                    $5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount('10')}
                    className="flex-1"
                  >
                    $10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount('25')}
                    className="flex-1"
                  >
                    $25
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount('50')}
                    className="flex-1"
                  >
                    $50
                  </Button>
                </div>

                {/* New Total */}
                {amount && parseFloat(amount) > 0 && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="font-medium">New Prize Pool</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          ${newTotal.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Info */}
              <Card className="border-info/20 bg-info/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
                    <div className="text-sm space-y-1">
                      <p className="font-medium">How funding works</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Your contribution increases the prize pool for all participants</li>
                        <li>Funds are securely held in the smart contract</li>
                        <li>You'll be credited as a sponsor for this quiz</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isPending || isConfirming}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleFund}
                  disabled={!amount || parseFloat(amount) <= 0 || isPending || isConfirming || isConfirmed || isLoading}
                >
                  {(isPending || isConfirming) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isPending ? 'Waiting for wallet...' : 'Confirming...'}
                    </>
                  ) : isConfirmed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Funded!
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4" />
                      Fund {amount || '0'} cUSD
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
