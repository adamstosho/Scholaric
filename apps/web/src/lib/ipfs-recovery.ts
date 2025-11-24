/**
 * Utility to recover IPFS hash for old quizzes by querying blockchain events
 * This helps with quizzes created before the localStorage mapping was implemented
 */

import { QUIZ_MANAGER_ADDRESS } from '@/lib/contracts/addresses'
import quizManagerAbi from '@/lib/contracts/quiz-manager-abi.json'
import { PublicClient, decodeEventLog } from 'viem'

/**
 * Query QuizCreated event to get transaction hash for a quiz
 * This can help identify the creation transaction
 */
export async function getQuizCreationTransaction(
  quizId: bigint,
  publicClient: PublicClient
): Promise<{ transactionHash: `0x${string}`; blockNumber: bigint } | null> {
  try {
    // Query QuizCreated events filtered by quizId
    const events = await publicClient.getLogs({
      address: QUIZ_MANAGER_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'QuizCreated',
        inputs: [
          { indexed: true, name: 'quizId', type: 'uint256' },
          { indexed: true, name: 'creator', type: 'address' },
          { indexed: false, name: 'metadataHash', type: 'bytes32' },
          { indexed: false, name: 'startTime', type: 'uint256' },
          { indexed: false, name: 'maxParticipants', type: 'uint256' },
        ],
      },
      args: {
        quizId: quizId,
      },
      fromBlock: 0n,
    })

    if (events.length === 0) {
      return null
    }

    // Get the first (and should be only) event for this quizId
    const event = events[0]
    return {
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
    }
  } catch (error) {
    console.error('Error querying QuizCreated event:', error)
    return null
  }
}

/**
 * Try to recover IPFS hash from transaction receipt
 * Note: This won't work if the IPFS hash wasn't stored in the transaction
 * But we can at least identify the transaction for manual recovery
 */
export async function tryRecoverIpfsHashFromTransaction(
  transactionHash: `0x${string}`,
  publicClient: PublicClient
): Promise<string | null> {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: transactionHash,
    })

    // The IPFS hash is not directly in the receipt, but we can log the transaction
    // for manual recovery or future indexing
    console.log('Quiz creation transaction:', {
      hash: transactionHash,
      blockNumber: receipt.blockNumber,
    })

    // Return null as we can't recover it from the receipt
    // The metadataHash in the event is keccak256(IPFS hash), which can't be reversed
    return null
  } catch (error) {
    console.error('Error fetching transaction receipt:', error)
    return null
  }
}

