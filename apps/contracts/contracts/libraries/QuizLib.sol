// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QuizLib
 * @dev Library for quiz-related calculations and utilities
 */
library QuizLib {
    /**
     * @dev Calculate commitment hash from answers and salt
     * @param answers Encoded answers
     * @param salt Random salt
     * @return commitment Keccak256 hash of answers + salt
     */
    function calculateCommitment(
        bytes memory answers,
        bytes32 salt
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(answers, salt));
    }
    
    /**
     * @dev Verify commitment matches reveal
     * @param commitment Original commitment
     * @param answers Revealed answers
     * @param salt Revealed salt
     * @return isValid True if commitment matches
     */
    function verifyCommitment(
        bytes32 commitment,
        bytes memory answers,
        bytes32 salt
    ) internal pure returns (bool) {
        bytes32 calculatedCommitment = calculateCommitment(answers, salt);
        return commitment == calculatedCommitment;
    }
    
    /**
     * @dev Calculate score by comparing answers
     * @param userAnswers User's answers
     * @param correctAnswers Correct answers
     * @return score Number of correct answers
     */
    function calculateScore(
        bytes memory userAnswers,
        bytes memory correctAnswers
    ) internal pure returns (uint256) {
        require(userAnswers.length == correctAnswers.length, "Answer length mismatch");
        
        uint256 score = 0;
        for (uint256 i = 0; i < userAnswers.length; i++) {
            if (userAnswers[i] == correctAnswers[i]) {
                score++;
            }
        }
        
        return score;
    }
    
    /**
     * @dev Calculate reward distribution
     * @param scores Array of participant scores
     * @param prizePool Total prize pool
     * @return rewards Array of reward amounts
     */
    function calculateRewards(
        uint256[] memory scores,
        uint256 prizePool
    ) internal pure returns (uint256[] memory rewards) {
        rewards = new uint256[](scores.length);
        
        if (scores.length == 0 || prizePool == 0) {
            return rewards;
        }
        
        // Calculate total score
        uint256 totalScore = 0;
        for (uint256 i = 0; i < scores.length; i++) {
            totalScore += scores[i];
        }
        
        if (totalScore == 0) {
            return rewards;
        }
        
        // Distribute proportionally to scores
        for (uint256 i = 0; i < scores.length; i++) {
            if (scores[i] > 0) {
                rewards[i] = (prizePool * scores[i]) / totalScore;
            }
        }
        
        return rewards;
    }
    
    /**
     * @dev Calculate top N performers
     * @param participants Array of participant addresses
     * @param scores Array of scores
     * @param topN Number of top performers
     * @return topPerformers Array of top performer addresses
     * @return topScores Array of top scores
     */
    function getTopPerformers(
        address[] memory participants,
        uint256[] memory scores,
        uint256 topN
    ) internal pure returns (
        address[] memory topPerformers,
        uint256[] memory topScores
    ) {
        require(participants.length == scores.length, "Length mismatch");
        
        if (topN > participants.length) {
            topN = participants.length;
        }
        
        topPerformers = new address[](topN);
        topScores = new uint256[](topN);
        
        // Simple selection sort for top N
        // In production, consider using a more efficient algorithm
        for (uint256 i = 0; i < topN; i++) {
            uint256 maxIndex = i;
            for (uint256 j = i + 1; j < participants.length; j++) {
                if (scores[j] > scores[maxIndex]) {
                    maxIndex = j;
                }
            }
            
            // Swap
            if (maxIndex != i) {
                address tempAddr = participants[i];
                participants[i] = participants[maxIndex];
                participants[maxIndex] = tempAddr;
                
                uint256 tempScore = scores[i];
                scores[i] = scores[maxIndex];
                scores[maxIndex] = tempScore;
            }
            
            topPerformers[i] = participants[i];
            topScores[i] = scores[i];
        }
        
        return (topPerformers, topScores);
    }
}

