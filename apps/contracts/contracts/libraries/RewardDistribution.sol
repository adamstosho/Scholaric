// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RewardDistribution
 * @dev Library for different reward distribution strategies
 */
library RewardDistribution {
    /**
     * @dev Proportional distribution - rewards based on score percentage
     * @param scores Array of participant scores
     * @param prizePool Total prize pool amount
     * @return rewards Array of reward amounts
     */
    function proportionalDistribution(
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
        
        // Distribute proportionally
        uint256 distributed = 0;
        for (uint256 i = 0; i < scores.length; i++) {
            if (scores[i] > 0) {
                rewards[i] = (prizePool * scores[i]) / totalScore;
                distributed += rewards[i];
            }
        }
        
        // Handle rounding errors - give remainder to highest scorer
        if (distributed < prizePool && scores.length > 0) {
            uint256 remainder = prizePool - distributed;
            uint256 maxIndex = 0;
            uint256 maxScore = scores[0];
            
            for (uint256 i = 1; i < scores.length; i++) {
                if (scores[i] > maxScore) {
                    maxScore = scores[i];
                    maxIndex = i;
                }
            }
            
            rewards[maxIndex] += remainder;
        }
        
        return rewards;
    }
    
    /**
     * @dev Top N winners distribution - only top N get rewards
     * @param participants Array of participant addresses
     * @param scores Array of scores
     * @param prizePool Total prize pool
     * @param topN Number of top winners
     * @param percentages Percentages for each position (must sum to 100)
     * @return recipients Array of recipient addresses
     * @return amounts Array of reward amounts
     */
    function topNWinnersDistribution(
        address[] memory participants,
        uint256[] memory scores,
        uint256 prizePool,
        uint256 topN,
        uint256[] memory percentages
    ) internal pure returns (
        address[] memory recipients,
        uint256[] memory amounts
    ) {
        require(participants.length == scores.length, "Length mismatch");
        require(topN > 0 && topN <= participants.length, "Invalid topN");
        require(percentages.length == topN, "Percentages length mismatch");
        
        // Verify percentages sum to 100
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            totalPercentage += percentages[i];
        }
        require(totalPercentage == 100, "Percentages must sum to 100");
        
        // Sort by score (simple bubble sort for small arrays)
        address[] memory sortedParticipants = new address[](participants.length);
        uint256[] memory sortedScores = new uint256[](scores.length);
        
        // Copy arrays
        for (uint256 i = 0; i < participants.length; i++) {
            sortedParticipants[i] = participants[i];
            sortedScores[i] = scores[i];
        }
        
        // Sort descending
        for (uint256 i = 0; i < sortedScores.length; i++) {
            for (uint256 j = i + 1; j < sortedScores.length; j++) {
                if (sortedScores[j] > sortedScores[i]) {
                    // Swap scores
                    uint256 tempScore = sortedScores[i];
                    sortedScores[i] = sortedScores[j];
                    sortedScores[j] = tempScore;
                    
                    // Swap participants
                    address tempAddr = sortedParticipants[i];
                    sortedParticipants[i] = sortedParticipants[j];
                    sortedParticipants[j] = tempAddr;
                }
            }
        }
        
        // Allocate rewards to top N
        recipients = new address[](topN);
        amounts = new uint256[](topN);
        
        for (uint256 i = 0; i < topN; i++) {
            recipients[i] = sortedParticipants[i];
            amounts[i] = (prizePool * percentages[i]) / 100;
        }
        
        return (recipients, amounts);
    }
    
    /**
     * @dev Tiered distribution - different percentages for score ranges
     * @param participants Array of participant addresses
     * @param scores Array of scores
     * @param totalQuestions Total number of questions
     * @param prizePool Total prize pool
     * @param tierThresholds Score percentage thresholds for each tier
     * @param tierPercentages Percentage of pool for each tier
     * @return recipients Array of recipient addresses
     * @return amounts Array of reward amounts
     */
    function tieredDistribution(
        address[] memory participants,
        uint256[] memory scores,
        uint256 totalQuestions,
        uint256 prizePool,
        uint256[] memory tierThresholds, // e.g., [90, 70, 50] for 90%, 70%, 50%
        uint256[] memory tierPercentages // e.g., [40, 35, 20, 5] for 4 tiers
    ) internal pure returns (
        address[] memory recipients,
        uint256[] memory amounts
    ) {
        require(participants.length == scores.length, "Length mismatch");
        require(tierThresholds.length + 1 == tierPercentages.length, "Tier config mismatch");
        
        recipients = new address[](participants.length);
        amounts = new uint256[](participants.length);
        
        // Count participants in each tier
        uint256[] memory tierCounts = new uint256[](tierPercentages.length);
        for (uint256 i = 0; i < participants.length; i++) {
            uint256 scorePercentage = (scores[i] * 100) / totalQuestions;
            uint256 tier = getTier(scorePercentage, tierThresholds);
            tierCounts[tier]++;
        }
        
        // Calculate tier pools
        uint256[] memory tierPools = new uint256[](tierPercentages.length);
        for (uint256 i = 0; i < tierPercentages.length; i++) {
            tierPools[i] = (prizePool * tierPercentages[i]) / 100;
        }
        
        // Distribute within each tier proportionally
        for (uint256 i = 0; i < participants.length; i++) {
            recipients[i] = participants[i];
            uint256 scorePercentage = (scores[i] * 100) / totalQuestions;
            uint256 tier = getTier(scorePercentage, tierThresholds);
            
            if (tierCounts[tier] > 0 && tierPools[tier] > 0) {
                // Distribute tier pool proportionally within tier
                uint256 tierTotalScore = 0;
                for (uint256 j = 0; j < participants.length; j++) {
                    uint256 jScorePercentage = (scores[j] * 100) / totalQuestions;
                    uint256 jTier = getTier(jScorePercentage, tierThresholds);
                    if (jTier == tier) {
                        tierTotalScore += scores[j];
                    }
                }
                
                if (tierTotalScore > 0) {
                    amounts[i] = (tierPools[tier] * scores[i]) / tierTotalScore;
                }
            }
        }
        
        return (recipients, amounts);
    }
    
    /**
     * @dev Get tier for a score percentage
     */
    function getTier(
        uint256 scorePercentage,
        uint256[] memory thresholds
    ) internal pure returns (uint256) {
        for (uint256 i = 0; i < thresholds.length; i++) {
            if (scorePercentage >= thresholds[i]) {
                return i;
            }
        }
        return thresholds.length; // Lowest tier
    }
    
    /**
     * @dev Apply minimum score filter
     * @param minScore Minimum score required to receive rewards
     * @param minScorePercentage Minimum score percentage (0-100)
     * @param totalQuestions Total number of questions
     */
    function filterByMinimumScore(
        address[] memory participants,
        uint256[] memory scores,
        uint256 minScore,
        uint256 minScorePercentage,
        uint256 totalQuestions
    ) internal pure returns (
        address[] memory filteredParticipants,
        uint256[] memory filteredScores
    ) {
        // Count eligible participants
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            bool eligible = false;
            if (minScore > 0 && scores[i] >= minScore) {
                eligible = true;
            }
            if (minScorePercentage > 0) {
                uint256 scorePercentage = (scores[i] * 100) / totalQuestions;
                if (scorePercentage >= minScorePercentage) {
                    eligible = true;
                }
            }
            if (eligible) {
                eligibleCount++;
            }
        }
        
        // Create filtered arrays
        filteredParticipants = new address[](eligibleCount);
        filteredScores = new uint256[](eligibleCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            bool eligible = false;
            if (minScore > 0 && scores[i] >= minScore) {
                eligible = true;
            }
            if (minScorePercentage > 0) {
                uint256 scorePercentage = (scores[i] * 100) / totalQuestions;
                if (scorePercentage >= minScorePercentage) {
                    eligible = true;
                }
            }
            
            if (eligible) {
                filteredParticipants[index] = participants[i];
                filteredScores[index] = scores[i];
                index++;
            }
        }
        
        return (filteredParticipants, filteredScores);
    }
}

