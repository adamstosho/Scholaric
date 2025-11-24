"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUIZ_MANAGER_ADDRESS } from "@/lib/contracts/addresses";
import quizManagerAbi from "@/lib/contracts/quiz-manager-abi.json";
import { parseEther, keccak256, concat, stringToBytes, toHex, isHex, bytesToHex } from "viem";

/**
 * Hook to get all quiz IDs
 */
export function useGetAllQuizIds() {
  return useReadContract({
    address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
    abi: quizManagerAbi,
    functionName: "getAllQuizIds",
  });
}

/**
 * Hook to get quiz details
 */
export function useGetQuiz(quizId: bigint | undefined) {
  return useReadContract({
    address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
    abi: quizManagerAbi,
    functionName: "getQuiz",
    args: quizId !== undefined ? [quizId] : undefined,
    query: {
      enabled: quizId !== undefined,
    },
  });
}

/**
 * Hook to get participants for a quiz
 */
export function useGetParticipants(quizId: bigint | undefined) {
  return useReadContract({
    address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
    abi: quizManagerAbi,
    functionName: "getParticipants",
    args: quizId !== undefined ? [quizId] : undefined,
    query: {
      enabled: quizId !== undefined,
    },
  });
}

/**
 * Hook to get participant data
 */
export function useGetParticipantData(quizId: bigint | undefined, participantAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
    abi: quizManagerAbi,
    functionName: "getParticipantData",
    args: quizId !== undefined && participantAddress ? [quizId, participantAddress] : undefined,
    query: {
      enabled: quizId !== undefined && participantAddress !== undefined,
    },
  });
}

/**
 * Hook to create a quiz
 */
export function useCreateQuiz() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createQuiz = async (
    metadataHash: `0x${string}`,
    maxParticipants: bigint,
    startTime: bigint,
    duration: bigint,
    correctAnswersHash: `0x${string}`
  ) => {
    try {
      // Reset any previous errors
      reset();
      
      // writeContract can throw synchronously for validation errors
      writeContract({
        address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
        abi: quizManagerAbi,
        functionName: "createQuiz",
        args: [metadataHash, maxParticipants, startTime, duration, correctAnswersHash],
      });
      
      // If writeContract succeeds, it doesn't throw, but transaction errors
      // will appear in the error state
    } catch (err: any) {
      // Handle synchronous validation errors
      throw err;
    }
  };

  return {
    createQuiz,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  };
}

/**
 * Hook to fund a quiz
 */
export function useFundQuiz() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const fundQuiz = async (quizId: bigint, amount: string) => {
    const amountWei = parseEther(amount);
    writeContract({
      address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
      abi: quizManagerAbi,
      functionName: "fundQuiz",
      args: [quizId],
      value: amountWei,
    });
  };

  return {
    fundQuiz,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to join a quiz
 */
export function useJoinQuiz() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const joinQuiz = async (quizId: bigint) => {
    writeContract({
      address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
      abi: quizManagerAbi,
      functionName: "joinQuiz",
      args: [quizId],
    });
  };

  return {
    joinQuiz,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to commit an answer
 */
export function useCommitAnswer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const commitAnswer = async (quizId: bigint, commitment: `0x${string}`) => {
    writeContract({
      address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
      abi: quizManagerAbi,
      functionName: "commitAnswer",
      args: [quizId, commitment],
    });
  };

  return {
    commitAnswer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to reveal an answer
 */
export function useRevealAnswer() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  // Enable receipt waiting so the app can react on confirmation (invalidate cache, persist on-chain state)
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash: hash,
    query: {
      enabled: Boolean(hash),
    },
  });

  const queryClient = useQueryClient();

  // When the reveal transaction is confirmed, invalidate relevant queries so UI refreshes
  useEffect(() => {
    if (isConfirmed) {
      try {
        queryClient.invalidateQueries({ queryKey: ["getParticipantData"] });
        queryClient.invalidateQueries({ queryKey: ["getRewards"] });
      } catch (e) {
        console.warn('Could not invalidate queries after reveal confirmation', e)
      }
    }
  }, [isConfirmed, queryClient]);

  const revealAnswer = async (
    quizId: bigint,
    answers: Uint8Array,
    salt: `0x${string}` | string,
    correctAnswers: Uint8Array,
    score: bigint
  ) => {
    try {
      // CRITICAL: Normalize salt to plain string primitive
      // Step 1: Convert to string using String() - always produces primitive
      let saltStr = String(salt).trim()

      // Step 2: If it looks like JSON object, try to extract hex value
      if (saltStr.startsWith('{') || saltStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(saltStr)
          // Try common property names where hex might be stored
          const extracted = parsed?.normalized || parsed?.original || parsed?.salt || parsed?.value || parsed?.hex || parsed?.[0]
          if (extracted && typeof extracted === 'string') {
            saltStr = extracted
          }
        } catch (e) {
          // Not JSON, continue with raw string
        }
      }

      // Step 3: Extract hex substring if value contains extra text
      const hexMatch = saltStr.match(/0x[0-9a-fA-F]{1,128}/i)
      if (hexMatch) {
        saltStr = hexMatch[0]
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

      // Step 6: Pad/truncate to exactly 64 hex chars (32 bytes)
      let normalizedHex = cleanHex
      if (normalizedHex.length < 64) {
        normalizedHex = normalizedHex.padStart(64, '0')
      } else if (normalizedHex.length > 64) {
        normalizedHex = normalizedHex.slice(0, 64)
      }

      // Step 7: Create final salt as plain string primitive (using + not template literal)
      // This MUST be a plain string, not an object or wrapped value
      const saltFinal = ('0x' + normalizedHex) as `0x${string}`

      // Step 8: Final validation - ensure it's a string and valid hex
      if (typeof saltFinal !== 'string') {
        throw new Error(`Salt is not a string: ${typeof saltFinal}`)
      }
      if (!isHex(saltFinal)) {
        throw new Error(`Salt is not valid hex: ${saltFinal}`)
      }
      if (saltFinal.length !== 66) {
        throw new Error(`Salt length is incorrect: ${saltFinal.length}, expected 66 (0x + 64 hex chars)`)
      }
      
      console.log('✅ Salt prepared:', {
        original: salt,
        normalized: saltFinal,
        type: typeof saltFinal,
        length: saltFinal.length,
        isString: typeof saltFinal === 'string',
        isHex: isHex(saltFinal)
      })

      // CRITICAL: viem's encodeBytes expects hex strings for bytes type, not Uint8Array
      // Convert Uint8Array to hex strings to ensure proper encoding
      const answersArray = answers instanceof Uint8Array ? answers : new Uint8Array(answers)
      const correctAnswersArray = correctAnswers instanceof Uint8Array ? correctAnswers : new Uint8Array(correctAnswers)
      
      // Convert to hex strings - viem's encodeBytes needs hex strings
      const answersHex = bytesToHex(answersArray) as `0x${string}`
      const correctAnswersHex = bytesToHex(correctAnswersArray) as `0x${string}`
      
      console.log('🔍 Final parameters:', {
        quizId: quizId.toString(),
        answersType: 'hex string (from Uint8Array)',
        answersLength: answersArray.length,
        answersHex: answersHex.substring(0, 50) + '...',
        saltType: typeof saltFinal,
        saltLength: saltFinal.length,
        saltValue: saltFinal,
        correctAnswersType: 'hex string (from Uint8Array)',
        correctAnswersLength: correctAnswersArray.length,
        correctAnswersHex: correctAnswersHex.substring(0, 50) + '...',
        score: score.toString()
      })
      
      console.log('📤 Calling writeContract with hex strings for bytes parameters...')
      
      // CRITICAL: Final check - ensure saltFinal is a plain string primitive
      // viem's padHex function requires a string, not an object
      // Use the most explicit way to ensure it's a string primitive
      let saltForContract: `0x${string}`
      
      // Force conversion to string primitive using multiple methods
      if (typeof saltFinal === 'string') {
        saltForContract = saltFinal as `0x${string}`
      } else {
        // If somehow not a string, force conversion
        const str = String(saltFinal)
        saltForContract = str as `0x${string}`
      }
      
      // Final validation - must be exactly 66 chars (0x + 64 hex)
      if (typeof saltForContract !== 'string') {
        throw new Error(`Salt is not a string before writeContract: ${typeof saltForContract}, value: ${saltForContract}`)
      }
      if (saltForContract.length !== 66) {
        throw new Error(`Salt length is incorrect: ${saltForContract.length}, expected 66, value: ${saltForContract}`)
      }
      if (!isHex(saltForContract)) {
        throw new Error(`Salt is not valid hex before writeContract: ${saltForContract}`)
      }
      
      // CRITICAL: Create a completely fresh string primitive
      // Extract just the hex part and rebuild the string using template literal
      // This ensures viem receives a pure string primitive, not an object
      const hexPart = saltForContract.slice(2).toLowerCase()
      const saltString = `0x${hexPart}` as `0x${string}`
      
      // Final validation - must be exactly 66 chars and valid hex
      if (typeof saltString !== 'string') {
        throw new Error(`Salt is not a string after normalization: ${typeof saltString}`)
      }
      if (saltString.length !== 66) {
        throw new Error(`Salt length is incorrect: ${saltString.length}, expected 66`)
      }
      if (!isHex(saltString)) {
        throw new Error(`Salt is not valid hex: ${saltString}`)
      }
      
      console.log('🔍 Pre-writeContract validation:', {
        saltType: typeof saltString,
        saltLength: saltString.length,
        saltValue: saltString,
        isString: typeof saltString === 'string',
        isHex: isHex(saltString)
      })
      
      // CRITICAL: Check if wallet is connected before calling writeContract
      if (!isConnected || !address) {
        throw new Error('Wallet is not connected. Please connect your wallet first.')
      }

      // Pass Uint8Array for bytes and hex string for bytes32
      // This matches the contract ABI exactly
      // CRITICAL: saltString MUST be a plain string primitive for viem
      console.log('🔍 About to call writeContract:', {
        isConnected,
        address,
        saltType: typeof saltString,
        saltLength: saltString.length,
        saltValue: saltString.substring(0, 20) + '...'
      })

      try {
        // writeContract should automatically prompt wallet if not connected,
        // but we've already checked above. This call will trigger the wallet prompt.
        // NOTE: writeContract doesn't return a value - it triggers the wallet prompt asynchronously
        writeContract({
          address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
          abi: quizManagerAbi,
          functionName: 'revealAnswer',
          args: [
            quizId,
            answersHex,               // Hex string for bytes - viem's encodeBytes expects this
            saltString,              // Plain hex string for bytes32 - MUST be string primitive
            correctAnswersHex,       // Hex string for bytes - viem's encodeBytes expects this
            score
          ],
        })
        console.log('✅ writeContract called successfully - wallet should prompt now')
        console.log('⏳ Waiting for wallet prompt and user confirmation...')
      } catch (syncErr: any) {
        console.error('❌ writeContract threw synchronously:', {
          error: syncErr,
          message: syncErr?.message,
          shortMessage: syncErr?.shortMessage,
          name: syncErr?.name,
          stack: syncErr?.stack,
          saltType: typeof saltString,
          saltLength: saltString?.length,
          saltValue: saltString?.substring?.(0, 20)
        })
        
        // Check for specific encoding errors
        if (syncErr?.message?.includes('replace') || syncErr?.message?.includes('hex_')) {
          throw new Error(`Salt encoding error: The salt value is not in the correct format. Please check the salt value.`)
        }
        
        throw syncErr
      }
    } catch (err: any) {
      console.error('❌ Error in revealAnswer:', {
        error: err,
        message: err?.message,
        shortMessage: err?.shortMessage,
        cause: err?.cause,
        stack: err?.stack
      })
      throw err
    }
  };

  // Ignore receipt errors - receipt polling is disabled
  // Only show errors from writeContract
  const combinedError = error;

  return {
    revealAnswer,
    hash: hash,
    isPending: isPending,
    isConfirming: false, // Receipt waiting is disabled
    isConfirmed: false, // We'll check via refresh instead
    error: combinedError,
  };
}

/**
 * Hook to end a quiz
 */
export function useEndQuiz() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const endQuiz = async (quizId: bigint) => {
    writeContract({
      address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
      abi: quizManagerAbi,
      functionName: "endQuiz",
      args: [quizId],
    });
  };

  return {
    endQuiz,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to distribute rewards
 */
export function useDistributeRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const queryClient = useQueryClient();

  const distributeRewards = async (quizId: bigint) => {
    writeContract({
      address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
      abi: quizManagerAbi,
      functionName: "distributeRewards",
      args: [quizId],
    });

    // Invalidate and refetch reward data after distribution
    queryClient.invalidateQueries({ queryKey: ["getRewards", quizId] });
  };

  return {
    distributeRewards,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to fetch reward data for a quiz
 */
export function useGetRewards(quizId: bigint | undefined) {
  return useReadContract({
    address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
    abi: quizManagerAbi,
    functionName: "getRewards",
    args: quizId !== undefined ? [quizId] : undefined,
    query: {
      enabled: quizId !== undefined,
    },
  });
}

/**
 * Hook to fetch participant-specific reward data
 */
export function useGetParticipantReward(quizId: bigint | undefined, participantAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
    abi: quizManagerAbi,
    functionName: "getParticipantData",
    args: quizId !== undefined && participantAddress ? [quizId, participantAddress] : undefined,
    query: {
      enabled: quizId !== undefined && participantAddress !== undefined,
    },
  });
}

/**
 * Utility function to calculate commitment hash
 */
export function calculateCommitment(answers: Uint8Array, salt: `0x${string}`): `0x${string}` {
  // Solidity's abi.encodePacked(answers, salt) directly concatenates the bytes
  // viem's concat can handle Uint8Array and hex strings directly
  // This matches the original implementation and Solidity's abi.encodePacked
  return keccak256(concat([answers, salt]));
}

/**
 * Utility function to hash correct answers
 */
export function hashCorrectAnswers(correctAnswers: string): `0x${string}` {
  return keccak256(stringToBytes(correctAnswers));
}

