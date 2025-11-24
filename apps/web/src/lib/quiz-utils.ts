/**
 * Utility functions for quiz data processing
 */

import { formatEther } from "viem";
import { fetchQuizMetadata } from "./ipfs";
import { useGetQuiz } from "@/hooks/useQuizContract";

export interface QuizOnChainData {
  quizId: bigint;
  creator: `0x${string}`;
  metadataHash: `0x${string}`;
  prizePool: bigint;
  maxParticipants: bigint;
  startTime: bigint;
  duration: bigint;
  endTime: bigint;
  status: number; // 0: Upcoming, 1: Live, 2: Ended, 3: Cancelled
  participantCount: bigint;
  isVerified: boolean;
}

export interface QuizDisplayData {
  id: string;
  title: string;
  description: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  difficulty: string;
  subject: string;
  duration: number;
  questions: number;
  grade: string;
  status: 'live' | 'upcoming' | 'ended' | 'cancelled';
  verified: boolean;
  gasSponsored: boolean;
  sponsor: string;
  creator: string;
  startTime: number;
  endTime: number;
}

/**
 * Convert IPFS hash (bytes32) back to IPFS hash string
 * Note: This is a simplified approach. In production, you might want to store
 * the actual IPFS hash separately or use a different encoding.
 */
export function bytes32ToIpfsHash(hash: `0x${string}`): string {
  // For now, we'll need to store the IPFS hash mapping separately
  // This is a placeholder - in production, you'd decode the bytes32 properly
  return hash;
}

/**
 * Fetch quiz data from contract and IPFS
 */
export async function fetchQuizData(
  quizId: bigint,
  onChainData: QuizOnChainData
): Promise<QuizDisplayData | null> {
  try {
    // Convert metadataHash to IPFS hash
    // Note: In production, you'd need to properly decode bytes32 to IPFS hash
    // For now, we'll try to fetch metadata using the hash directly
    // This is a simplified approach
    
    // Try to fetch metadata from IPFS
    // Since we can't directly convert bytes32 to IPFS hash, we'll need to
    // store the mapping or use a different approach
    let metadata = null;
    
    try {
      // In a real implementation, you'd decode the bytes32 hash
      // For now, we'll create a fallback
      metadata = {
        title: `Quiz #${quizId.toString()}`,
        description: "Quiz description",
        subject: "General",
        difficulty: "Intermediate",
        grade: "9-12",
        questions: [],
      };
    } catch (err) {
      console.error(`Failed to fetch metadata for quiz ${quizId}:`, err);
    }

    // Determine status
    const now = Math.floor(Date.now() / 1000);
    let status: 'live' | 'upcoming' | 'ended' | 'cancelled' = 'upcoming';
    
    if (onChainData.status === 3) {
      status = 'cancelled';
    } else if (onChainData.status === 2) {
      status = 'ended';
    } else if (Number(onChainData.startTime) <= now && Number(onChainData.endTime) > now) {
      status = 'live';
    } else if (Number(onChainData.startTime) > now) {
      status = 'upcoming';
    } else {
      status = 'ended';
    }

    return {
      id: quizId.toString(),
      title: metadata?.title || `Quiz #${quizId.toString()}`,
      description: metadata?.description || "No description available",
      prizePool: parseFloat(formatEther(onChainData.prizePool)),
      participants: Number(onChainData.participantCount),
      maxParticipants: Number(onChainData.maxParticipants),
      difficulty: metadata?.difficulty || "Intermediate",
      subject: metadata?.subject || "General",
      duration: Number(onChainData.duration) / 60, // Convert seconds to minutes
      questions: metadata?.questions?.length || 0,
      grade: metadata?.grade || "9-12",
      status,
      verified: onChainData.isVerified,
      gasSponsored: false, // This would come from metadata or separate contract
      sponsor: "CeloScholar", // This would come from metadata
      creator: onChainData.creator,
      startTime: Number(onChainData.startTime),
      endTime: Number(onChainData.endTime),
    };
  } catch (error) {
    console.error(`Error processing quiz ${quizId}:`, error);
    return null;
  }
}


