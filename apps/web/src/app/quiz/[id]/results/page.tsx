'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Trophy, CheckCircle, Coins, TrendingUp, Share2, Home, RefreshCw, Loader2, AlertCircle, Copy, Check, Twitter, Facebook } from 'lucide-react'
import { useGetQuiz, useGetParticipantData, useGetParticipants, useRevealAnswer, calculateCommitment, hashCorrectAnswers } from '@/hooks/useQuizContract'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { formatEther, decodeErrorResult, bytesToHex, hexToBytes, keccak256, concat } from 'viem'
import { fetchQuizMetadata } from '@/lib/ipfs'
import { getIpfsHash } from '@/lib/ipfs-storage'
import { usePublicClient, useConnect } from 'wagmi'
import { QUIZ_MANAGER_ADDRESS } from '@/lib/contracts/addresses'
import quizManagerAbi from '@/lib/contracts/quiz-manager-abi.json'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const quizId = BigInt(params.id)
  const { toast } = useToast()
  const { data: quizData, isLoading: isLoadingQuiz } = useGetQuiz(quizId)
  const { address, isConnected } = useSafeAccount()
  const publicClient = usePublicClient()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { data: participantData, isLoading: isLoadingParticipant } = useGetParticipantData(quizId, address as `0x${string}` | undefined)
  const { data: allParticipants } = useGetParticipants(quizId)
  const { revealAnswer, hash: revealHash, isPending: isRevealing, isConfirming: isConfirmingReveal, isConfirmed: isRevealConfirmed, error: revealErrorFromHook } = useRevealAnswer()
  
  const [metadata, setMetadata] = useState<any>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [rank, setRank] = useState<number | null>(null)
  const [allParticipantResults, setAllParticipantResults] = useState<any[]>([])
  const [isLoadingAllResults, setIsLoadingAllResults] = useState(false)
  const [revealError, setRevealError] = useState<string | null>(null)
  const [isRevealingManual, setIsRevealingManual] = useState(false)
  const hasAttemptedReveal = useRef(false)
  
  // Off-chain calculated results (displayed immediately)
  const [offChainScore, setOffChainScore] = useState<number | null>(null)
  const [offChainRank, setOffChainRank] = useState<number | null>(null)
  const [offChainReward, setOffChainReward] = useState<number | null>(null)
  const [isOffChainCalculated, setIsOffChainCalculated] = useState(false)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  
  const isCreator = address?.toLowerCase() === quizData?.creator?.toLowerCase()

  // Share functionality
  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/quiz/${params.id}/results`
  }

  // When the reveal transaction is confirmed on-chain, persist on-chain participant data
  useEffect(() => {
    const persistOnchainReveal = async () => {
      if (!isRevealConfirmed || !address || !publicClient) return
      try {
        const pData = await publicClient.readContract({
          address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
          abi: quizManagerAbi,
          functionName: 'getParticipantData',
          args: [quizId, address as `0x${string}`],
        }) as any

        if (pData) {
          try {
            localStorage.setItem(`quiz_${params.id}_score_blockchain_${address}`, String(Number(pData.score)))
            localStorage.setItem(`quiz_${params.id}_revealed_blockchain_${address}`, pData.hasRevealed ? 'true' : 'false')
            const reward = parseFloat(formatEther(pData.reward))
            localStorage.setItem(`quiz_${params.id}_reward_blockchain_${address}`, reward.toFixed(4))
          } catch (e) {
            console.warn('Could not persist on-chain participant data to localStorage', e)
          }
        }
      } catch (err) {
        console.warn('Could not fetch participant data to persist after reveal confirmation:', err)
      }
    }

    persistOnchainReveal()
  }, [isRevealConfirmed, address, publicClient, params.id, quizId])

  const getShareText = () => {
    if (!showResults) {
      return `Check out this quiz on Scholaric! Quiz ID: ${params.id}`
    }
    const scoreText = `${score}/${totalQuestions}`
    const percentageText = totalQuestions > 0 ? `${Math.round((score / totalQuestions) * 100)}%` : '0%'
    const rankText = displayRank ? `Rank: #${displayRank}` : ''
    const rewardText = reward > 0 ? `Reward: $${reward.toFixed(2)}` : ''
    
    let text = `🎯 I scored ${scoreText} (${percentageText}) on this quiz!`
    if (rankText) text += ` ${rankText}`
    if (rewardText) text += ` ${rewardText}`
    text += `\n\nTry it yourself: ${getShareUrl()}`
    
    return text
  }

  const handleCopyLink = async () => {
    try {
      const url = getShareUrl()
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      toast({
        title: "Link copied!",
        description: "Quiz results link has been copied to your clipboard.",
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
          title: 'My Quiz Results - Scholaric',
          text: getShareText(),
          url: getShareUrl(),
        })
        setIsShareMenuOpen(false)
        toast({
          title: "Shared!",
          description: "Quiz results have been shared successfully.",
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

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!quizData?.metadataHash) {
        setIsLoadingMetadata(false)
        return
      }

      try {
        const ipfsHash = getIpfsHash(params.id)
        if (ipfsHash) {
          console.log('📥 Fetching metadata from IPFS:', ipfsHash)
          const fetchedMetadata = await fetchQuizMetadata(ipfsHash)
          setMetadata(fetchedMetadata)
          console.log('✅ Metadata loaded successfully')
        } else {
          console.warn('⚠️ IPFS hash not found for quiz', params.id)
        }
        setIsLoadingMetadata(false)
      } catch (err: any) {
        console.error('❌ Error fetching metadata:', err)
        // Don't set metadata to null - allow user to retry via button click
        setIsLoadingMetadata(false)
        // Show a toast notification
        toast({
          title: "Metadata Loading Failed",
          description: "Quiz metadata could not be loaded. You can try clicking 'Reveal My Answers' to retry.",
          variant: "destructive",
        })
      }
    }

    if (quizData) {
      fetchMetadata()
    }
  }, [quizData, params.id, toast])

  // Handle reveal errors from hook
  useEffect(() => {
    if (revealErrorFromHook) {
      let errorMsg = revealErrorFromHook.message || revealErrorFromHook.shortMessage || 'Failed to reveal answers'
      
      console.error('❌ revealErrorFromHook detected:', {
        error: revealErrorFromHook,
        message: errorMsg,
        name: revealErrorFromHook?.name,
        cause: revealErrorFromHook?.cause
      })
      
      // Check for wallet connection errors first
      if (errorMsg.includes('connector') || 
          errorMsg.includes('User rejected') ||
          errorMsg.includes('user rejected') ||
          errorMsg.includes('Connection') ||
          errorMsg.includes('No connector') ||
          errorMsg.includes('not connected') ||
          errorMsg.includes('Wallet is not connected')) {
        console.error('❌ Wallet connection error:', revealErrorFromHook)
        errorMsg = 'Please connect your wallet to reveal your answers. If already connected, try disconnecting and reconnecting.'
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Wallet Connection Required",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // Check for encoding errors
      if (errorMsg.includes('replace') || 
          errorMsg.includes('hex_') ||
          errorMsg.includes('Salt encoding') ||
          errorMsg.includes('encoding')) {
        console.error('❌ Encoding error detected:', revealErrorFromHook)
        errorMsg = 'There was an error encoding the transaction. Please try again or contact support.'
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Encoding Error",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // CRITICAL: Ignore hex_.replace errors - these are viem internal errors that don't affect the transaction
      // The transaction is sent successfully via sendTransaction, this error is just from viem's processing
      if (errorMsg.includes('hex_.replace is not a function') || 
          errorMsg.includes('replace is not a function')) {
        console.warn('Ignoring viem internal error (hex_.replace) - transaction was sent successfully:', revealErrorFromHook)
        // Don't show this error - transaction was sent successfully
        // Just clear the loading state and wait for hash
        if (revealHash) {
          setIsRevealingManual(false)
          // Don't set error, transaction was sent
        }
        return // Exit early, don't show error
      }
      
      // Handle specific RPC errors gracefully
      if (errorMsg.includes('block is out of range') || 
          errorMsg.includes('block out of range') ||
          errorMsg.includes('receipt error') ||
          errorMsg.includes('TimeoutError')) {
        // These are often RPC sync issues - transaction might still succeed
        // Don't show error immediately, wait a bit to see if transaction confirms
        console.warn('RPC sync issue detected, waiting to see if transaction succeeds:', revealErrorFromHook)
        
        // Wait 10 seconds to see if transaction confirms despite the error
        const timeout = setTimeout(() => {
          // Only show error if transaction hasn't confirmed
          if (!isRevealConfirmed && !revealHash) {
            errorMsg = 'Network sync issue. Please check your wallet or try again in a few seconds.'
            setRevealError(errorMsg)
            setIsRevealingManual(false)
            hasAttemptedReveal.current = false
            
            toast({
              title: "Transaction may have failed",
              description: errorMsg,
              variant: "destructive",
            })
          }
        }, 10000)
        
        return () => clearTimeout(timeout)
      } else {
        // For other errors, show immediately with more details
        // Check for common contract revert reasons
        if (errorMsg.includes('Invalid commitment')) {
          errorMsg = 'The answers or salt do not match your commitment. Please ensure you are using the same answers and salt from when you committed.'
        } else if (errorMsg.includes('Invalid correct answers')) {
          errorMsg = 'The correct answers hash does not match. This may indicate a problem with the quiz metadata.'
        } else if (errorMsg.includes('Score mismatch')) {
          errorMsg = 'The calculated score does not match. Please recalculate your score.'
        } else if (errorMsg.includes('Quiz not ended')) {
          errorMsg = 'The quiz has not ended yet. Please wait for the quiz to end before revealing answers.'
        } else if (errorMsg.includes('Must commit first')) {
          errorMsg = 'You must commit your answers first before revealing them.'
        } else if (errorMsg.includes('Already revealed')) {
          errorMsg = 'You have already revealed your answers for this quiz.'
        }
        
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        
        toast({
          title: "Transaction failed",
          description: errorMsg,
          variant: "destructive",
        })
      }
    }
  }, [revealErrorFromHook, toast, isRevealConfirmed, revealHash])

  // Handle reveal confirmation
  // For sendTransaction, we won't get automatic confirmation, so check for hash instead
  useEffect(() => {
    if (isRevealConfirmed) {
      setIsRevealingManual(false)
      hasAttemptedReveal.current = false
      setRevealError(null) // Clear any errors
      // Results are already displayed off-chain, so just show confirmation
      toast({
        title: "Transaction Confirmed!",
        description: "Your answers have been confirmed on the blockchain.",
      })
      // Refresh to sync with on-chain data (off-chain should already match)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } else if (revealHash && !isRevealing && !isConfirmingReveal) {
      // Transaction was sent - check its receipt to see actual status
      console.log('🔍 Transaction hash received, checking receipt:', revealHash)
      
      const checkReceipt = async () => {
        if (!publicClient || !revealHash) return
        
        try {
          // Wait for transaction to be mined
          await new Promise(resolve => setTimeout(resolve, 5000))
          
          const receipt = await publicClient.getTransactionReceipt({ hash: revealHash })
          
          console.log('📄 Transaction receipt:', {
            status: receipt.status,
            blockNumber: receipt.blockNumber.toString(),
            gasUsed: receipt.gasUsed.toString(),
            transactionHash: receipt.transactionHash
          })
          
          if (receipt.status === 'success') {
            console.log('✅ Transaction succeeded!')
            setIsRevealingManual(false)
            hasAttemptedReveal.current = false
            setRevealError(null)
            // Results are already displayed off-chain, so just show confirmation
            toast({
              title: "Transaction Confirmed!",
              description: "Your answers have been confirmed on the blockchain.",
            })
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          } else if (receipt.status === 'reverted') {
            console.error('❌ Transaction reverted!')
            
            let revertReason = 'Unknown error'
            let userFriendlyError = 'Transaction was reverted by the contract.'
            
            // Try to decode the revert reason from the transaction
            try {
              const tx = await publicClient.getTransaction({ hash: revealHash })
              console.error('📄 Transaction details:', {
                to: tx.to,
                data: tx.input.substring(0, 100) + '...',
                value: tx.value.toString()
              })
              
              // Try to decode error from transaction return data or logs
              // Note: We can't simulate here because variables are out of scope
              // Instead, try to decode from the receipt or transaction data
              try {
                // Try to decode error from transaction input data (function selector + args)
                // The error might be in the return data, but we can check logs
                if (receipt.logs && receipt.logs.length > 0) {
                  console.error('📋 Transaction logs (checking for error events):', receipt.logs)
                  
                  // Look for any error events or revert reasons in logs
                  for (const log of receipt.logs) {
                    try {
                      if (log.topics && log.topics.length > 0) {
                        // Try to decode as an error event
                        const topic0 = log.topics[0]
                        console.log('Log topic[0]:', topic0)
                      }
                    } catch (logErr) {
                      // Ignore individual log errors
                    }
                  }
                }
                
                // Common revert reasons based on the contract
                // Since we can't simulate, provide helpful guidance
                userFriendlyError = 'Transaction was reverted. Common causes:\n' +
                  '1. Score mismatch - The calculated score doesn\'t match the contract\'s calculation\n' +
                  '2. Commitment mismatch - Answers or salt don\'t match your commitment\n' +
                  '3. Answer length mismatch - Your answers length doesn\'t match correct answers\n' +
                  '4. Correct answers hash mismatch - The correct answers format doesn\'t match\n' +
                  '\nPlease check the console logs above for verification details.'
                
              } catch (decodeErr) {
                console.warn('Could not decode error details:', decodeErr)
              }
              
              // Also try to decode from receipt return data if available
              if (receipt.logs && receipt.logs.length > 0) {
                console.error('📋 Transaction logs:', receipt.logs)
              }
            } catch (err) {
              console.error('Could not get transaction details:', err)
            }
            
            console.error('📋 Revert reason:', revertReason)
            console.error('💬 User-friendly error:', userFriendlyError)
            
            setRevealError(userFriendlyError)
            setIsRevealingManual(false)
            hasAttemptedReveal.current = false
            toast({
              title: "Transaction Reverted",
              description: userFriendlyError,
              variant: "destructive",
            })
          }
        } catch (err: any) {
          console.warn('⚠️ Could not get transaction receipt (might still be pending):', err)
          // Transaction might still be pending, wait and refresh
          setIsRevealingManual(false)
          toast({
            title: "Checking transaction...",
            description: "Transaction is pending. Refreshing page to check status...",
          })
          setTimeout(() => {
            window.location.reload()
          }, 10000)
        }
      }
      
      checkReceipt()
    }
  }, [isRevealConfirmed, revealHash, isRevealing, isConfirmingReveal, revealErrorFromHook, toast])
  
  // Also check if we have a transaction hash but receipt polling failed
  // In this case, the transaction might still succeed - auto-refresh after a delay
  useEffect(() => {
    if (revealHash && !isRevealConfirmed && revealErrorFromHook && 
        (revealErrorFromHook.message?.includes('block is out of range') || 
         revealErrorFromHook.message?.includes('TimeoutError') ||
         revealErrorFromHook.message?.includes('receipt error'))) {
      // Transaction was sent but receipt polling failed
      // Wait 15 seconds then auto-refresh to check if transaction succeeded
      console.log('Transaction hash exists but receipt polling failed, will auto-refresh to check status:', revealHash)
      
      const checkTimeout = setTimeout(() => {
        // Auto-refresh to check if transaction succeeded
        if (!isRevealConfirmed) {
          console.log('Auto-refreshing to check transaction status...')
          window.location.reload()
        }
      }, 15000) // Wait 15 seconds before auto-refresh
      
      return () => clearTimeout(checkTimeout)
    }
  }, [revealHash, isRevealConfirmed, revealErrorFromHook])

  // Manual reveal function
  const handleReveal = async () => {
    // Check basic requirements
    if (!quizData || !participantData || participantData.hasRevealed || !participantData.hasCommitted || isRevealing || isConfirmingReveal) {
      return
    }

    // If metadata is missing, try to fetch it first
    if (!metadata) {
      console.log('⚠️ Metadata missing, attempting to fetch...')
      setIsLoadingMetadata(true)
      setRevealError(null)
      
      try {
        const ipfsHash = getIpfsHash(params.id)
        if (!ipfsHash) {
          throw new Error('IPFS hash not found for this quiz')
        }
        
        toast({
          title: "Loading quiz data...",
          description: "Fetching quiz metadata from IPFS.",
        })
        
        const fetchedMetadata = await fetchQuizMetadata(ipfsHash)
        setMetadata(fetchedMetadata)
        setIsLoadingMetadata(false)
        
        toast({
          title: "Metadata loaded",
          description: "Quiz data loaded successfully. Proceeding with reveal...",
        })
        
        // Continue with reveal - metadata is now available
        // The function will continue below
      } catch (err: any) {
        console.error('❌ Failed to fetch metadata:', err)
        setIsLoadingMetadata(false)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        
        let errorMsg = 'Failed to load quiz metadata from IPFS. '
        if (err.message?.includes('CORS') || err.message?.includes('Failed to fetch')) {
          errorMsg += 'This may be due to network or CORS issues. Please try refreshing the page or check your internet connection.'
        } else {
          errorMsg += 'Please refresh the page and try again.'
        }
        
        setRevealError(errorMsg)
        toast({
          title: "Metadata Required",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
    }
    
    // Double-check metadata is available after potential fetch
    if (!metadata) {
      const errorMsg = 'Quiz metadata is required but could not be loaded. Please refresh the page.'
      setRevealError(errorMsg)
      setIsRevealingManual(false)
      hasAttemptedReveal.current = false
      toast({
        title: "Metadata Required",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    try {
      setIsRevealingManual(true)
      setRevealError(null)
      hasAttemptedReveal.current = true

      // CRITICAL: Check wallet connection first
      // writeContract should trigger connection automatically, but we need to ensure wallet is ready
      if (!isConnected || !address) {
        console.log('🔌 Wallet not connected, attempting to connect...')
        
        // Check if wallet extension is available
        if (typeof window === 'undefined' || !window.ethereum) {
          const errorMsg = 'No wallet extension found. Please install a wallet extension (like MetaMask or MiniPay) and try again.'
          setRevealError(errorMsg)
          setIsRevealingManual(false)
          hasAttemptedReveal.current = false
          toast({
            title: "No Wallet Found",
            description: errorMsg,
            variant: "destructive",
          })
          return
        }
        
        // Try to connect using injected connector (MiniPay, MetaMask, etc.)
        const injectedConnector = connectors.find((c) => c.id === "injected")
        if (injectedConnector) {
          // Trigger connection (this is async but doesn't return a promise that resolves on connect)
          connect({ connector: injectedConnector }).catch((connectErr: any) => {
            console.error('❌ Wallet connection error:', connectErr)
            const errorMsg = connectErr?.message || 'Failed to connect wallet. Please connect manually and try again.'
            setRevealError(errorMsg)
            setIsRevealingManual(false)
            hasAttemptedReveal.current = false
            toast({
              title: "Connection Failed",
              description: errorMsg,
              variant: "destructive",
            })
          })
          
          // Show message and wait a moment for connection
          toast({
            title: "Connecting wallet...",
            description: "Please approve the connection in your wallet.",
          })
          
          // Wait a bit and check if connected (give user time to approve)
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // If still not connected after waiting, show error
          // Note: We'll still try to proceed - writeContract might trigger connection
          if (!isConnected || !address) {
            console.warn('⚠️ Wallet still not connected after 2 seconds, but proceeding - writeContract may trigger connection')
            // Don't return - let writeContract try to trigger connection
          }
        } else {
          const errorMsg = 'No wallet connector found. Please install a wallet extension and connect.'
          setRevealError(errorMsg)
          setIsRevealingManual(false)
          hasAttemptedReveal.current = false
          toast({
            title: "No Wallet Found",
            description: errorMsg,
            variant: "destructive",
          })
          return
        }
      }

      const now = Math.floor(Date.now() / 1000)
      const quizEnded = Number(quizData.endTime) <= now || Number(quizData.status) === 2
      if (!quizEnded) {
        toast({
          title: "Quiz not ended",
          description: "The quiz has not ended yet. Please wait for the quiz to end.",
          variant: "destructive",
        })
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        return
      }

      // Get answers and salt from storage (try several key variants and both local/session storage)
      const addressLower = address.toLowerCase()
      const keysToTry = [
        `quiz_${params.id}_answers_${address}`,
        `quiz_${params.id}_answers_${addressLower}`,
        `quiz_${params.id}_answers_${address?.toUpperCase()}`,
      ]
      const saltKeysToTry = [
        `quiz_${params.id}_salt_${address}`,
        `quiz_${params.id}_salt_${addressLower}`,
        `quiz_${params.id}_salt_${address?.toUpperCase()}`,
      ]

      let storedAnswers: string | null = null
      let storedSaltRaw: string | null = null

      for (const k of keysToTry) {
        const v = localStorage.getItem(k) || sessionStorage.getItem(k)
        if (v) {
          storedAnswers = v
          break
        }
      }

      for (const k of saltKeysToTry) {
        const v = localStorage.getItem(k) || sessionStorage.getItem(k)
        if (v) {
          storedSaltRaw = v
          break
        }
      }

      if (!storedAnswers || !storedSaltRaw) {
        const errorMsg = 'Answers or salt not found. This can happen if you cleared your browser data or committed from a different device.'
        setRevealError(errorMsg)
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        return
      }

      // Parse answers - CRITICAL: Use the exact same format as during commit
      const answers = JSON.parse(storedAnswers)
      
      // CRITICAL: The answers must be in the exact same format as when committed
      // During commit: JSON.stringify(answers) was used
      // So we need to use JSON.stringify(answers) again with the same values
      // Don't convert to numbers if they weren't numbers during commit
      console.log('🔍 Retrieved answers from storage:', {
        storedAnswers,
        parsedAnswers: answers,
        answersType: typeof answers,
        answersIsArray: Array.isArray(answers),
        answersLength: answers?.length
      })

      // BULLETPROOF salt handling: ensure it's a plain string primitive
      console.log('🔍 Raw salt from storage:', {
        storedSaltRaw,
        type: typeof storedSaltRaw,
        constructor: (storedSaltRaw as any)?.constructor?.name,
      })

      // Step 1: Convert to string using String() - always produces primitive
      let saltStr = String(storedSaltRaw).trim()

      // Step 2: If it looks like JSON object, try to extract hex value
      if (saltStr.startsWith('{') || saltStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(saltStr)
          // Try common property names where hex might be stored
          const extracted = parsed?.normalized || parsed?.original || parsed?.salt || parsed?.value || parsed?.hex || parsed?.[0]
          if (extracted && typeof extracted === 'string') {
            saltStr = extracted
            console.log('✂️  Extracted salt from JSON:', saltStr)
          }
        } catch (e) {
          // Not JSON, continue with raw string
          console.log('⚠️  Not JSON, continuing with raw string')
        }
      }

      // Step 3: Extract hex substring if value contains extra text
      const hexMatch = saltStr.match(/0x[0-9a-fA-F]{1,128}/)
      if (hexMatch) {
        saltStr = hexMatch[0]
        console.log('✂️  Extracted hex match:', saltStr)
      }

      // Step 4: Ensure 0x prefix
      if (!saltStr.startsWith('0x')) {
        saltStr = '0x' + saltStr
      }

      // Step 5: Clean to hex chars only and normalize length
      const cleanHex = saltStr.slice(2).replace(/[^0-9a-fA-F]/g, '').toLowerCase()
      if (cleanHex.length === 0) {
        throw new Error('Salt contains no valid hex characters')
      }

      let normalizedHex = cleanHex
      if (normalizedHex.length < 64) {
        normalizedHex = normalizedHex.padStart(64, '0')
      } else if (normalizedHex.length > 64) {
        normalizedHex = normalizedHex.slice(0, 64)
      }

      // Step 6: Create final salt as string primitive (using + not template literal)
      const normalizedSalt = ('0x' + normalizedHex) as `0x${string}`

      console.log('✅ Final salt:', normalizedSalt)

      // Calculate correct answers - MUST match how it was created
      // During creation: JSON.stringify(questions.map(q => q.correctAnswer))
      // So we need to use the exact same format
      const correctAnswersArray = metadata.questions.map((q: any) => q.correctAnswer)
      const correctAnswersString = JSON.stringify(correctAnswersArray)
      
      // CRITICAL: Use the EXACT same format as during commit
      // During commit: JSON.stringify(answers) was used directly
      // So we must use JSON.stringify(answers) with the same values
      // The storedAnswers is already JSON.stringify(answers), so we should use it directly
      // OR use JSON.stringify(answers) which should produce the same string
      const answersJsonString = storedAnswers // Use the stored JSON string directly to ensure exact match
      
      console.log('🔍 Answers format verification:', {
        originalAnswers: answers,
        answersJsonString,
        storedAnswersString: storedAnswers,
        match: answersJsonString === storedAnswers,
        // Also try JSON.stringify to see if it matches
        jsonStringified: JSON.stringify(answers),
        jsonStringifiedMatch: JSON.stringify(answers) === storedAnswers
      })

      // Convert to bytes - answers for commitment/reveal
      const textEncoder = new TextEncoder()
      const answersBytes = textEncoder.encode(answersJsonString)
      
      // For correctAnswers, use the EXACT same string format as during creation
      // This ensures the hash matches
      const correctAnswersBytes = textEncoder.encode(correctAnswersString)
      
      // CRITICAL: Calculate score the same way the contract does - byte-by-byte comparison
      // The contract's QuizLib.calculateScore requires:
      // 1. userAnswers.length == correctAnswers.length (will revert if not equal)
      // 2. Compares bytes byte-by-byte
      // 3. score <= answers.length
      
      // Verify lengths match (contract requirement)
      if (answersBytes.length !== correctAnswersBytes.length) {
        const errorMsg = `Answer length mismatch! User answers: ${answersBytes.length} bytes, Correct answers: ${correctAnswersBytes.length} bytes. The contract requires them to be equal.`
        console.error('❌ Answer length mismatch:', {
          answersBytesLength: answersBytes.length,
          correctAnswersBytesLength: correctAnswersBytes.length,
          answersBytes: Array.from(answersBytes),
          correctAnswersBytes: Array.from(correctAnswersBytes)
        })
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Answer Length Mismatch",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // CRITICAL: Calculate REAL score by comparing actual answers (not bytes)
      // The contract uses byte-by-byte comparison which is incorrect
      // We need to compare the actual answer values for correct scoring
      const numericAnswers = answers.map((a: any) => typeof a === 'string' ? parseInt(a, 10) : a)
      const numericCorrectAnswers = correctAnswersArray.map((a: any) => typeof a === 'string' ? parseInt(a, 10) : a)
      
      // Calculate real score by comparing actual answer values
      let realScore = 0
      for (let i = 0; i < numericAnswers.length; i++) {
        if (numericAnswers[i] === numericCorrectAnswers[i]) {
          realScore++
        }
      }
      
      // Also calculate contract score (byte-by-byte) for contract verification
      // The contract uses byte-by-byte comparison, so we need to match that for the transaction
      let contractScore = 0
      for (let i = 0; i < answersBytes.length; i++) {
        if (answersBytes[i] === correctAnswersBytes[i]) {
          contractScore++
        }
      }
      
      console.log('🔍 Score calculation:', {
        numericAnswers,
        numericCorrectAnswers,
        realScore: realScore,
        contractScore: contractScore,
        totalQuestions: numericAnswers.length,
        answersBytesLength: answersBytes.length,
        correctAnswersBytesLength: correctAnswersBytes.length
      })
      
      // Use real score for display and reward calculation
      const score = realScore
      
      // ============================================
      // OFF-CHAIN CALCULATION: Calculate and display results immediately
      // ============================================
      try {
        // Use REAL score (comparing actual answers) for display and reward calculation
        const calculatedScore = realScore  // Use real score, not contract score
        
        // Fetch all participants and their scores to calculate rank and reward
        let allParticipantScores: Array<{ address: string; score: number; hasRevealed: boolean }> = []
        
        if (allParticipants && publicClient) {
          for (const participantAddress of allParticipants) {
            try {
              const pData = await publicClient.readContract({
                address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
                abi: quizManagerAbi,
                functionName: 'getParticipantData',
                args: [quizId, participantAddress as `0x${string}`],
              }) as any
              
              if (pData) {
                const participantScore = pData.hasRevealed ? Number(pData.score) : 0
                allParticipantScores.push({
                  address: participantAddress.toLowerCase(),
                  score: participantScore,
                  hasRevealed: pData.hasRevealed
                })
              }
            } catch (err) {
              // Skip if error
            }
          }
        }
        
        // Add current user's score (if not already in list or if they haven't revealed yet)
        const currentUserLower = address?.toLowerCase()
        const userIndex = allParticipantScores.findIndex(p => p.address === currentUserLower)
        if (userIndex >= 0) {
          // Update existing entry with calculated score
          allParticipantScores[userIndex].score = calculatedScore
          allParticipantScores[userIndex].hasRevealed = true
        } else if (currentUserLower) {
          // Add current user
          allParticipantScores.push({
            address: currentUserLower,
            score: calculatedScore,
            hasRevealed: true
          })
        }
        
        // Sort by score (descending) to calculate rank
        allParticipantScores.sort((a, b) => {
          if (a.hasRevealed && !b.hasRevealed) return -1
          if (!a.hasRevealed && b.hasRevealed) return 1
          if (a.hasRevealed && b.hasRevealed) return b.score - a.score
          return 0
        })
        
        // Calculate rank
        const userRankIndex = allParticipantScores.findIndex(p => p.address === currentUserLower)
        const calculatedRank = userRankIndex >= 0 ? userRankIndex + 1 : null
        
        // Calculate reward using proportional distribution
        // Formula: (Prize Pool × Participant Score) / Total Score of All Participants
        let calculatedReward = 0
        const prizePool = quizData.prizePool ? parseFloat(formatEther(quizData.prizePool as bigint)) : 0
        
        if (prizePool > 0 && calculatedScore > 0) {
          // Only count revealed participants for reward calculation
          const revealedParticipants = allParticipantScores.filter(p => p.hasRevealed && p.score > 0)
          const totalScore = revealedParticipants.reduce((sum, p) => sum + p.score, 0)
          
          if (totalScore > 0) {
            calculatedReward = (prizePool * calculatedScore) / totalScore
          }
        }
        
        // Set off-chain calculated results immediately
        setOffChainScore(calculatedScore)
        setOffChainRank(calculatedRank)
        setOffChainReward(calculatedReward)
        setIsOffChainCalculated(true)
        
        // Show success message
        toast({
          title: "Results Calculated!",
          description: `You scored ${calculatedScore} out of ${metadata.questions.length} questions correctly.`,
        })
        // Persist off-chain (immediate) results to localStorage so rewards page shows them instantly
        try {
          if (address) {
            const addr = address as string
            localStorage.setItem(`quiz_${params.id}_revealed_${addr}`, 'true')
            localStorage.setItem(`quiz_${params.id}_score_${addr}`, calculatedScore.toString())
            localStorage.setItem(`quiz_${params.id}_percentage_${addr}`, (metadata.questions.length > 0 ? ((calculatedScore / metadata.questions.length) * 100).toFixed(2) : '0.00'))
            localStorage.setItem(`quiz_${params.id}_reward_${addr}`, calculatedReward.toFixed(4))

            // Update user's total balance (accumulate simulated/instant rewards)
            const currentBalance = parseFloat(localStorage.getItem('user_reward_balance') || '0')
            const newBalance = currentBalance + calculatedReward
            localStorage.setItem('user_reward_balance', newBalance.toFixed(4))
          }
        } catch (e) {
          console.warn('Could not persist off-chain results to localStorage:', e)
        }
      } catch (calcErr: any) {
        // If off-chain calculation fails, still proceed with blockchain transaction
        console.warn('⚠️ Off-chain calculation failed, proceeding with blockchain transaction:', calcErr)
      }
      
      // Verify real score is valid (should be <= total questions)
      if (realScore > numericAnswers.length) {
        const errorMsg = `Invalid real score: ${realScore}. Score must be less than or equal to ${numericAnswers.length} (number of questions).`
        console.error('❌ Invalid real score:', { realScore, totalQuestions: numericAnswers.length })
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Invalid Score",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // Verify contract score is valid (contract requirement: score <= answers.length)
      if (contractScore > answersBytes.length) {
        const errorMsg = `Invalid contract score: ${contractScore}. Score must be less than or equal to ${answersBytes.length} (number of answer bytes).`
        console.error('❌ Invalid contract score:', { contractScore, answersLength: answersBytes.length })
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Invalid Score",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // CRITICAL: Verify correct answers hash matches
      const calculatedCorrectAnswersHash = hashCorrectAnswers(correctAnswersString)
      let storedCorrectAnswersHash: string = '0x0'
      try {
        if (publicClient) {
          const hash = await publicClient.readContract({
            address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
            abi: quizManagerAbi,
            functionName: 'correctAnswersHash',
            args: [quizId],
          }) as `0x${string}`
          storedCorrectAnswersHash = hash || '0x0'
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch correct answers hash from contract:', err)
      }
      
      console.log('🔍 Verifying correct answers hash:', {
        calculated: calculatedCorrectAnswersHash,
        stored: storedCorrectAnswersHash,
        match: calculatedCorrectAnswersHash.toLowerCase() === storedCorrectAnswersHash.toLowerCase(),
        correctAnswersString,
        correctAnswersArray
      })
      
      if (calculatedCorrectAnswersHash.toLowerCase() !== storedCorrectAnswersHash.toLowerCase()) {
        const errorMsg = 'The correct answers hash does not match. This may indicate a problem with the quiz metadata or the answers format.'
        console.error('❌ Correct answers hash mismatch:', { calculatedCorrectAnswersHash, storedCorrectAnswersHash })
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Correct Answers Hash Mismatch",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      console.log('🔍 Debug commitment calculation:', {
        answers: answers,
        answersJsonString,
        storedAnswers,
        answersBytesLength: answersBytes.length,
        answersBytesArray: Array.from(answersBytes),
        normalizedSalt,
        saltLength: normalizedSalt.length
      })

      // CRITICAL: Verify commitment matches before sending transaction
      // Calculate commitment the same way the contract will: keccak256(abi.encodePacked(answers, salt))
      // We use: keccak256(concat([answersBytes, salt]))
      const calculatedCommitment = calculateCommitment(answersBytes, normalizedSalt as `0x${string}`)
      
      // Commitment is calculated using Uint8Array directly, which matches what we'll send to contract
      console.log('🔍 Commitment calculation:', {
        calculatedCommitment,
        answersBytes: Array.from(answersBytes),
        answersBytesLength: answersBytes.length,
        salt: normalizedSalt,
        saltLength: normalizedSalt.length
      })
      
      // Fetch the stored commitment from the contract
      let storedCommitment: string = '0x0'
      try {
        if (address && publicClient) {
          const commitment = await publicClient.readContract({
            address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
            abi: quizManagerAbi,
            functionName: 'answerCommitments',
            args: [quizId, address as `0x${string}`],
          }) as `0x${string}`
          storedCommitment = commitment || '0x0'
          console.log('📋 Fetched stored commitment from contract:', storedCommitment)
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch commitment from contract:', err)
      }
      
      // CRITICAL: If stored commitment is 0x0, the user hasn't committed
      if (storedCommitment === '0x0' || storedCommitment === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const errorMsg = 'No commitment found on-chain. You may not have committed your answers, or the commitment was not stored correctly.'
        console.error('❌ No commitment found on-chain:', { storedCommitment, quizId: quizId.toString(), address })
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "No Commitment Found",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      console.log('🔍 Verifying commitment:', {
        calculated: calculatedCommitment,
        stored: storedCommitment,
        match: calculatedCommitment.toLowerCase() === storedCommitment.toLowerCase(),
        answersJsonString,
        answersBytes: Array.from(answersBytes),
        salt: normalizedSalt,
        saltLength: normalizedSalt.length
      })
      
      if (calculatedCommitment.toLowerCase() !== storedCommitment.toLowerCase()) {
        // Provide detailed error message with all values for debugging
        const errorMsg = `Commitment mismatch! Calculated: ${calculatedCommitment}, Stored: ${storedCommitment}. Answers: ${answersJsonString}, Salt: ${normalizedSalt}`
        console.error('❌ Commitment mismatch - DETAILED DEBUG:', { 
          calculatedCommitment, 
          storedCommitment,
          answersJsonString,
          answersBytes: Array.from(answersBytes),
          answersBytesLength: answersBytes.length,
          salt: normalizedSalt,
          saltLength: normalizedSalt.length,
          saltType: typeof normalizedSalt,
          // Try recalculating with exact values
          recalcAttempt: calculateCommitment(answersBytes, normalizedSalt as `0x${string}`)
        })
        setRevealError('The answers or salt do not match your commitment. Please ensure you are using the same answers and salt from when you committed.')
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Commitment Mismatch",
          description: 'The answers or salt do not match your commitment. Please check the console for detailed debugging information.',
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Revealing answers...",
        description: "Please confirm the transaction in your wallet.",
      })

      // CRITICAL: Verify all contract requirements before sending
      console.log('🔍 Verifying all contract requirements:')
      
      // Check 1: Quiz must have ended
      const currentTime = Math.floor(Date.now() / 1000)
      const quizEndTime = Number(quizData.endTime)
      const quizHasEnded = currentTime >= quizEndTime
      console.log('  - Quiz ended?', quizHasEnded, `(now: ${currentTime}, endTime: ${quizEndTime})`)
      
      if (!quizHasEnded) {
        const errorMsg = `Quiz has not ended yet. End time: ${new Date(quizEndTime * 1000).toLocaleString()}`
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Quiz Not Ended",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // Check 2: User must have committed
      const hasCommitted = participantData.hasCommitted
      console.log('  - Has committed?', hasCommitted)
      
      if (!hasCommitted) {
        const errorMsg = 'You must commit your answers first before revealing them.'
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Not Committed",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // Check 3: User must not have revealed yet
      const hasRevealed = participantData.hasRevealed
      console.log('  - Has revealed?', hasRevealed)
      
      if (hasRevealed) {
        const errorMsg = 'You have already revealed your answers for this quiz.'
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Already Revealed",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      // Check 4: Score must be valid (score <= answers.length)
      const scoreValid = score <= answersBytes.length
      console.log('  - Score valid?', scoreValid, `(score: ${score}, answersLength: ${answersBytes.length})`)
      
      if (!scoreValid) {
        const errorMsg = `Invalid score: ${score}. Score must be less than or equal to ${answersBytes.length} (number of answer bytes).`
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Invalid Score",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }
      
      console.log('✅ All requirements verified - proceeding with transaction')
      
      // Final summary before sending
      console.log('📋 FINAL VERIFICATION SUMMARY:', {
        quizId: quizId.toString(),
        answers: answers,
        answersJsonString: answersJsonString,
        storedAnswers: storedAnswers,
        answersBytes: Array.from(answersBytes),
        answersBytesLength: answersBytes.length,
        salt: normalizedSalt,
        correctAnswers: correctAnswersArray,
        correctAnswersBytes: Array.from(correctAnswersBytes),
        correctAnswersBytesLength: correctAnswersBytes.length,
        score,
        commitmentMatches: true,
        correctAnswersHashMatches: true,
        answerLengthsMatch: answersBytes.length === correctAnswersBytes.length,
        scoreValid: score <= answersBytes.length,
        quizHasEnded: true,
        hasCommitted: true,
        hasNotRevealed: true
      })
      
      console.log('🚀 Calling revealAnswer - quizId:', quizId.toString(), 'salt:', normalizedSalt, 'score:', score.toString())

      // CRITICAL: Final check - ensure wallet is connected before calling writeContract
      // writeContract should trigger connection, but we want to be explicit
      if (!isConnected || !address) {
        const errorMsg = 'Wallet is not connected. Please connect your wallet and try again.'
        console.error('❌ Wallet not connected before calling revealAnswer')
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Wallet Not Connected",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // CRITICAL: Verify commitment calculation matches what contract will calculate
      // The contract calculates: keccak256(abi.encodePacked(answers, salt))
      // We need to ensure the bytes we send match exactly what was used during commit
      console.log('🔍 Verifying commitment calculation before simulation:', {
        answersBytes: Array.from(answersBytes),
        answersBytesLength: answersBytes.length,
        normalizedSalt,
        saltLength: normalizedSalt.length,
        calculatedCommitment,
        storedCommitment
      })
      
      // Double-check: Calculate commitment using the exact same method as contract
      // Contract uses: keccak256(abi.encodePacked(answers, salt))
      // We use: keccak256(concat([answersBytes, salt]))
      // These should match, but let's verify the bytes are the same
      const answersHexForCommitment = bytesToHex(answersBytes) as `0x${string}`
      console.log('🔍 Commitment verification details:', {
        answersBytesArray: Array.from(answersBytes),
        answersHex: answersHexForCommitment,
        salt: normalizedSalt,
        calculatedCommitment,
        storedCommitment,
        match: calculatedCommitment.toLowerCase() === storedCommitment.toLowerCase()
      })
      
      if (calculatedCommitment.toLowerCase() !== storedCommitment.toLowerCase()) {
        const errorMsg = `Commitment mismatch! Calculated: ${calculatedCommitment}, Stored: ${storedCommitment}. Please ensure you are using the same answers and salt from when you committed.`
        console.error('❌ Commitment mismatch detected:', {
          calculated: calculatedCommitment,
          stored: storedCommitment,
          answersBytes: Array.from(answersBytes),
          salt: normalizedSalt
        })
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Commitment Mismatch",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // CRITICAL: Simulate the transaction first to catch errors before sending
      // IMPORTANT: viem's encodeBytes expects hex strings for bytes type
      // Convert Uint8Array to hex strings, but verify they represent the exact same bytes
      try {
        console.log('🔍 Simulating transaction to check for errors...')
        
        // Convert to hex strings for viem (encodeBytes expects hex strings)
        const answersHex = bytesToHex(answersBytes) as `0x${string}`
        const correctAnswersHex = bytesToHex(correctAnswersBytes) as `0x${string}`
        
        // Verify the hex strings represent the exact same bytes we used for commitment
        // This ensures the commitment will match in the contract
        const answersBytesFromHex = hexToBytes(answersHex)
        const commitmentFromHex = calculateCommitment(answersBytesFromHex, normalizedSalt as `0x${string}`)
        
        console.log('🔍 Final commitment verification before simulation:', {
          answersJsonString,
          answersBytes: Array.from(answersBytes),
          answersBytesLength: answersBytes.length,
          answersHex,
          answersBytesFromHex: Array.from(answersBytesFromHex),
          bytesMatch: JSON.stringify(Array.from(answersBytes)) === JSON.stringify(Array.from(answersBytesFromHex)),
          salt: normalizedSalt,
          calculatedCommitment,
          commitmentFromHex,
          storedCommitment,
          commitmentMatches: calculatedCommitment.toLowerCase() === storedCommitment.toLowerCase(),
          commitmentFromHexMatches: commitmentFromHex.toLowerCase() === storedCommitment.toLowerCase()
        })
        
        // CRITICAL: Verify hex conversion didn't change the bytes
        if (JSON.stringify(Array.from(answersBytes)) !== JSON.stringify(Array.from(answersBytesFromHex))) {
          const errorMsg = 'Internal error: Hex conversion changed the bytes. This should not happen.'
          console.error('❌ CRITICAL: Bytes mismatch after hex conversion:', {
            original: Array.from(answersBytes),
            fromHex: Array.from(answersBytesFromHex)
          })
          setRevealError(errorMsg)
          setIsRevealingManual(false)
          hasAttemptedReveal.current = false
          toast({
            title: "Internal Error",
            description: errorMsg,
            variant: "destructive",
          })
          return
        }
        
        // CRITICAL: Verify commitment from hex matches stored commitment
        if (commitmentFromHex.toLowerCase() !== storedCommitment.toLowerCase()) {
          const errorMsg = 'Internal error: Commitment from hex does not match stored commitment.'
          console.error('❌ CRITICAL: Commitment mismatch after hex conversion:', {
            commitmentFromHex,
            storedCommitment,
            calculatedCommitment
          })
          setRevealError(errorMsg)
          setIsRevealingManual(false)
          hasAttemptedReveal.current = false
          toast({
            title: "Internal Error",
            description: errorMsg,
            variant: "destructive",
          })
          return
        }
        
        // Final verification: The commitment MUST match before proceeding
        if (calculatedCommitment.toLowerCase() !== storedCommitment.toLowerCase()) {
          console.error('❌ CRITICAL: Commitment does not match even after all verifications!')
          setRevealError('The answers or salt do not match your commitment. Please ensure you are using the same answers and salt from when you committed.')
          setIsRevealingManual(false)
          hasAttemptedReveal.current = false
          return
        }
        
        // CRITICAL: Re-fetch stored commitment right before simulation to ensure we have the latest
        let latestStoredCommitment = storedCommitment
        try {
          if (address && publicClient) {
            const latestCommitment = await publicClient.readContract({
              address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
              abi: quizManagerAbi,
              functionName: 'answerCommitments',
              args: [quizId, address as `0x${string}`],
            }) as `0x${string}`
            latestStoredCommitment = latestCommitment || '0x0'
            if (latestStoredCommitment !== storedCommitment) {
              console.warn('⚠️ Stored commitment changed between checks:', { storedCommitment, latestStoredCommitment })
              storedCommitment = latestStoredCommitment
            }
          }
        } catch (err) {
          console.warn('⚠️ Could not re-fetch commitment:', err)
        }
        
        // Final check before simulation
        if (calculatedCommitment.toLowerCase() !== storedCommitment.toLowerCase()) {
          console.error('❌ FINAL CHECK FAILED: Commitment mismatch before simulation:', {
            calculatedCommitment,
            storedCommitment,
            answersJsonString,
            answersBytes: Array.from(answersBytes),
            salt: normalizedSalt
          })
          setRevealError('The answers or salt do not match your commitment. Please ensure you are using the same answers and salt from when you committed.')
          setIsRevealingManual(false)
          hasAttemptedReveal.current = false
          return
        }
        
        console.log('🔍 Simulation parameters:', {
          quizId: quizId.toString(),
          answersType: 'hex string',
          answersHex: answersHex.substring(0, 50) + '...',
          answersHexLength: answersHex.length,
          answersBytesLength: answersBytes.length,
          salt: normalizedSalt,
          saltType: typeof normalizedSalt,
          saltLength: normalizedSalt.length,
          correctAnswersType: 'hex string',
          correctAnswersHex: correctAnswersHex.substring(0, 50) + '...',
          correctAnswersHexLength: correctAnswersHex.length,
          correctAnswersBytesLength: correctAnswersBytes.length,
          score: score.toString(),
          storedCommitment,
          calculatedCommitment,
          commitmentFromHex,
          commitmentMatches: calculatedCommitment.toLowerCase() === storedCommitment.toLowerCase(),
          commitmentFromHexMatches: commitmentFromHex.toLowerCase() === storedCommitment.toLowerCase()
        })
        
        // Use contractScore for the contract (byte-by-byte), but realScore for display
        await publicClient.simulateContract({
          address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
          abi: quizManagerAbi,
          functionName: 'revealAnswer',
          args: [
            quizId,
            answersHex,                    // Hex string - viem's encodeBytes expects this
            normalizedSalt as `0x${string}`,
            correctAnswersHex,              // Hex string - viem's encodeBytes expects this
            BigInt(contractScore)          // Use contract score for contract verification
          ],
          account: address as `0x${string}`,
        })
        console.log('✅ Simulation succeeded - transaction should work')
      } catch (simErr: any) {
        console.error('❌ Simulation failed - transaction will revert:', simErr)
        const errorMsg = simErr.shortMessage || simErr.message || 'Transaction will revert'
        const errorMsgLower = errorMsg.toLowerCase()
        
        let userFriendlyError = 'Transaction will fail: '
        if (errorMsgLower.includes('invalid commitment') || errorMsgLower.includes('commitment')) {
          userFriendlyError = 'The answers or salt do not match your commitment. Please ensure you are using the same answers and salt from when you committed.'
        } else if (errorMsgLower.includes('invalid correct answers') || errorMsgLower.includes('correct answers hash')) {
          userFriendlyError = 'The correct answers hash does not match. This may indicate a problem with the quiz metadata.'
        } else if (errorMsgLower.includes('score mismatch') || errorMsgLower.includes('score')) {
          userFriendlyError = 'The calculated score does not match the contract\'s calculation. Please check your answers.'
        } else if (errorMsgLower.includes('quiz not ended') || errorMsgLower.includes('not ended')) {
          userFriendlyError = 'The quiz has not ended yet. Please wait for the quiz to end before revealing answers.'
        } else if (errorMsgLower.includes('must commit') || errorMsgLower.includes('commit first')) {
          userFriendlyError = 'You must commit your answers first before revealing them.'
        } else if (errorMsgLower.includes('already revealed')) {
          userFriendlyError = 'You have already revealed your answers for this quiz.'
        } else if (errorMsgLower.includes('invalid score')) {
          userFriendlyError = 'The score is invalid. Score must be less than or equal to the number of answer bytes.'
        } else if (errorMsgLower.includes('answer length mismatch') || errorMsgLower.includes('length mismatch')) {
          userFriendlyError = 'The length of your answers does not match the length of the correct answers.'
        } else {
          userFriendlyError = `Transaction will fail: ${errorMsg}`
        }
        
        setRevealError(userFriendlyError)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Transaction Will Fail",
          description: userFriendlyError,
          variant: "destructive",
        })
        return
      }

      // Call reveal - salt is guaranteed to be a plain string primitive
      // Note: revealAnswer may throw synchronously if encoding fails
      try {
        console.log('🚀 Calling revealAnswer - wallet should be connected:', { isConnected, address })
        // Use contractScore for contract, but realScore is used for display
        revealAnswer(
          quizId,
          answersBytes,
          normalizedSalt as `0x${string}`,
          correctAnswersBytes,
          BigInt(contractScore)  // Contract expects byte-by-byte score
        )
        // If no error thrown, transaction was initiated
        console.log('✅ revealAnswer called - waiting for wallet confirmation')
        // Note: Don't await - revealAnswer doesn't return a promise
        // The hook's state will update when the transaction is sent
        
        // Give a moment for writeContract to trigger wallet
        // If wallet prompt doesn't appear, it might be a connection issue
        setTimeout(() => {
          if (!revealHash && !isRevealing && !isConnecting) {
            console.warn('⚠️ No transaction hash after 3 seconds - wallet may not have prompted')
            // Don't show error yet - might still be processing
          }
        }, 3000)
      } catch (syncErr: any) {
        // Handle synchronous errors (encoding issues or connection issues)
        let errorMsg = syncErr?.message || syncErr?.shortMessage || 'Failed to encode transaction'
        
        // Check for wallet connection errors
        if (errorMsg.includes('connector') || errorMsg.includes('connect') || errorMsg.includes('wallet')) {
          errorMsg = 'Please connect your wallet to reveal your answers.'
        }
        
        console.error('❌ Synchronous error in revealAnswer:', syncErr)
        setRevealError(errorMsg)
        setIsRevealingManual(false)
        hasAttemptedReveal.current = false
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
        return // Exit early
      }
      
      // The transaction is now initiated, but we need to wait for the hook's state
      // The error will be caught by the useEffect watching revealErrorFromHook
    } catch (err: any) {
      const errorMsg = err.message || err.shortMessage || 'Failed to reveal answers'
      console.error('Error revealing answers:', err)
      setRevealError(errorMsg)
      toast({
        title: "Error revealing answers",
        description: errorMsg,
        variant: "destructive",
      })
      setIsRevealingManual(false)
      hasAttemptedReveal.current = false
    }
  }

  // Fetch all participant results if creator
  useEffect(() => {
    const fetchAllResults = async () => {
      if (!isCreator || !allParticipants || !quizData || !publicClient || allParticipants.length === 0) {
        return
      }

      setIsLoadingAllResults(true)
      try {
        const results: any[] = []
        for (const participantAddress of allParticipants) {
          try {
            const pData = await publicClient.readContract({
              address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
              abi: quizManagerAbi,
              functionName: 'getParticipantData',
              args: [quizId, participantAddress as `0x${string}`],
            }) as any

            if (pData) {
              results.push({
                address: participantAddress,
                score: pData.hasRevealed ? Number(pData.score) : null,
                reward: pData.hasRevealed ? parseFloat(formatEther(pData.reward)) : 0,
                hasRevealed: pData.hasRevealed,
                hasCommitted: pData.hasCommitted,
              })
            }
          } catch (err) {
            // Skip if error
          }
        }

        results.sort((a, b) => {
          if (a.hasRevealed && !b.hasRevealed) return -1
          if (!a.hasRevealed && b.hasRevealed) return 1
          if (a.hasRevealed && b.hasRevealed) return (b.score || 0) - (a.score || 0)
          return 0
        })
        setAllParticipantResults(results)

        if (participantData && participantData.hasRevealed) {
          const userRank = results.findIndex(r => r.address.toLowerCase() === address?.toLowerCase()) + 1
          setRank(userRank > 0 ? userRank : null)
        }
      } catch (err) {
        console.error('Error fetching all results:', err)
      } finally {
        setIsLoadingAllResults(false)
      }
    }

    fetchAllResults()
  }, [isCreator, allParticipants, quizData, publicClient, quizId, participantData, address])

  if (isLoadingQuiz || isLoadingParticipant || isLoadingMetadata || (isCreator && isLoadingAllResults)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!quizData || !address) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Error loading results</p>
            <p className="text-sm text-muted-foreground mt-2">Quiz not found.</p>
          </div>
        </main>
      </div>
    )
  }

  // Creator view
  if (isCreator) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
                  <p className="text-muted-foreground">View all participant results for your quiz</p>
                </div>

                {isLoadingAllResults ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading results...</p>
                  </div>
                ) : allParticipantResults.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No participants yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h2 className="text-xl font-semibold">Leaderboard</h2>
                      <div className="space-y-3">
                        {allParticipantResults.map((result, index) => (
                          <Card key={result.address} className="border-border">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-2xl font-bold text-primary">
                                    #{result.hasRevealed ? index + 1 : '-'}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {result.address.slice(0, 6)}...{result.address.slice(-4)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {result.hasRevealed ? (
                                        <>Score: {result.score}/{metadata?.questions?.length || 0}</>
                                      ) : result.hasCommitted ? (
                                        <>Answers committed, waiting for reveal...</>
                                      ) : (
                                        <>Not committed</>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {result.hasRevealed ? (
                                    <>
                                      <div className="font-bold text-primary">
                                        ${result.reward.toFixed(2)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Reward</div>
                                    </>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">Pending</div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button variant="outline" asChild>
                  <Link href={`/quiz/${params.id}`}>
                    Back to Quiz
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  // Not a participant
  if (!participantData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">Error loading results</p>
            <p className="text-sm text-muted-foreground mt-2">You may not have participated in this quiz.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href={`/quiz/${params.id}`}>
                Back to Quiz
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Participant view
  // Use off-chain calculated values if available, otherwise use on-chain data
  const score = isOffChainCalculated && offChainScore !== null 
    ? offChainScore 
    : (participantData.hasRevealed ? Number(participantData.score) : 0)
  const reward = isOffChainCalculated && offChainReward !== null
    ? offChainReward
    : parseFloat(formatEther(participantData.reward))
  const displayRank = isOffChainCalculated && offChainRank !== null
    ? offChainRank
    : rank
  const totalQuestions = metadata?.questions?.length || 0
  const totalParticipants = Number(quizData.participantCount)
  const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0
  
  // Show results if off-chain calculated OR if on-chain revealed
  const showResults = isOffChainCalculated || participantData.hasRevealed
  
  const now = Math.floor(Date.now() / 1000)
  const quizEnded = Number(quizData.endTime) <= now
  const canReveal = quizEnded && participantData.hasCommitted && !participantData.hasRevealed
  const isRevealingNow = isRevealingManual || isRevealing || isConfirmingReveal || isLoadingMetadata

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-6">
              {/* Results Header */}
              <Card className="border-border bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {showResults ? 'Quiz Completed!' : 'Answers Committed!'}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {showResults 
                        ? 'Great job! Here are your results.' 
                        : canReveal
                          ? 'Quiz has ended. Click the button below to reveal your answers.'
                          : 'Your answers are committed. Results will be available after the quiz ends.'}
                    </p>
                  </div>

                  {/* Score Display */}
                  {showResults ? (
                    <div className="flex items-center justify-center gap-8 flex-wrap">
                      <div>
                        <div className="text-5xl font-bold text-primary">
                          {score}/{totalQuestions}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Correct Answers
                        </div>
                      </div>
                      <div>
                        <div className="text-5xl font-bold text-primary">
                          {scorePercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Score
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-8 flex-wrap">
                      <div>
                        <div className="text-5xl font-bold text-muted-foreground">
                          ?/{totalQuestions}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Score Pending
                        </div>
                      </div>
                      <div>
                        <div className="text-5xl font-bold text-muted-foreground">
                          --
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Percentage
                        </div>
                      </div>
                    </div>
                  )}

                  {showResults && (
                    <Progress value={scorePercentage} className="h-3" />
                  )}
                  
                  {!showResults && canReveal && (
                    <div className="space-y-4">
                      <Button 
                        onClick={handleReveal}
                        className="w-full"
                        disabled={isRevealingNow}
                        size="lg"
                      >
                        {isRevealingNow ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Revealing...
                          </>
                        ) : (
                          'Reveal My Answers'
                        )}
                      </Button>
                      {revealError && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm">{revealError}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border">
                  <CardContent className="p-6 text-center space-y-2">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto" />
                    <div className="text-2xl font-bold">
                      {showResults && displayRank ? `#${displayRank}` : '--'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Your Rank
                    </div>
                    {!showResults && (
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-6 text-center space-y-2">
                    <Coins className="h-8 w-8 text-primary mx-auto" />
                    <div className="text-2xl font-bold text-primary">
                      ${reward.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Reward Earned
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardContent className="p-6 text-center space-y-2">
                    <CheckCircle className="h-8 w-8 text-success mx-auto" />
                    <div className="text-2xl font-bold">
                      {showResults ? `${score}/${totalQuestions}` : '?/?'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Correct / Total
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {totalParticipants} participants
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quiz Summary */}
              <Card className="border-border">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Quiz Summary</h2>
                  <div className="text-sm text-muted-foreground">
                    {showResults 
                      ? `You scored ${score} out of ${totalQuestions} questions correctly. Your answers have been revealed and scored.`
                      : `You scored ${score} out of ${totalQuestions} questions correctly. Your answers are committed and will be revealed after the quiz ends.`}
                  </div>
                  {showResults && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Answers Revealed</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 gap-2" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <DropdownMenu open={isShareMenuOpen} onOpenChange={setIsShareMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Results
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
                <Button className="flex-1 gap-2" asChild>
                  <Link href="/catalogue">
                    <RefreshCw className="h-4 w-4" />
                    Take Another Quiz
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

