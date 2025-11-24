"use client";

import { useGetAllQuizIds, useGetQuiz } from "./useQuizContract";
import { fetchQuizMetadata } from "@/lib/ipfs";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

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

export function useAllQuizzes() {
  const { data: quizIds, isLoading: isLoadingIds, error: idsError } = useGetAllQuizIds();
  const [quizzes, setQuizzes] = useState<QuizDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllQuizzes = async () => {
      if (isLoadingIds || !quizIds) {
        setIsLoading(true);
        return;
      }

      if (quizIds.length === 0) {
        setQuizzes([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const quizPromises = quizIds.map(async (quizId: bigint) => {
          try {
            // Fetch quiz data from contract
            const response = await fetch(`/api/quiz/${quizId.toString()}`);
            if (!response.ok) {
              // Fallback: fetch directly using contract read
              // For now, we'll skip failed fetches
              return null;
            }
            const quizData = await response.json();
            return quizData;
          } catch (err) {
            console.error(`Error fetching quiz ${quizId}:`, err);
            return null;
          }
        });

        const results = await Promise.all(quizPromises);
        const validQuizzes = results.filter((q): q is QuizDisplayData => q !== null);
        setQuizzes(validQuizzes);
      } catch (err: any) {
        console.error('Error fetching quizzes:', err);
        setError(err.message || 'Failed to fetch quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllQuizzes();
  }, [quizIds, isLoadingIds]);

  return {
    quizzes,
    isLoading: isLoading || isLoadingIds,
    error: error || (idsError ? 'Failed to fetch quiz IDs' : null),
  };
}


