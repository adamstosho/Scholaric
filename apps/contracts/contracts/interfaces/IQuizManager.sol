// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IQuizManager
 * @dev Interface for QuizManager contract
 */
interface IQuizManager {
    enum QuizStatus { Upcoming, Live, Ended, Cancelled }
    
    struct Quiz {
        uint256 quizId;
        address creator;
        bytes32 metadataHash;
        uint256 prizePool;
        uint256 maxParticipants;
        uint256 startTime;
        uint256 duration;
        uint256 endTime;
        QuizStatus status;
        uint256 participantCount;
        bool isVerified;
    }
    
    struct Participant {
        address participant;
        uint256 joinTime;
        bool hasCommitted;
        bool hasRevealed;
        uint256 score;
        uint256 reward;
    }
    
    event QuizCreated(
        uint256 indexed quizId,
        address indexed creator,
        bytes32 metadataHash,
        uint256 startTime,
        uint256 maxParticipants
    );
    
    event QuizJoined(
        uint256 indexed quizId,
        address indexed participant
    );
    
    event PrizePoolFunded(
        uint256 indexed quizId,
        address indexed funder,
        uint256 amount
    );
    
    event AnswerCommitted(
        uint256 indexed quizId,
        address indexed participant,
        bytes32 commitment
    );
    
    event AnswerRevealed(
        uint256 indexed quizId,
        address indexed participant,
        uint256 score
    );
    
    event QuizEnded(
        uint256 indexed quizId,
        uint256 totalParticipants
    );
    
    event RewardsDistributed(
        uint256 indexed quizId,
        address[] recipients,
        uint256[] amounts
    );
    
    event QuizCancelled(
        uint256 indexed quizId,
        address indexed creator,
        uint256 refundedAmount
    );
    
    function createQuiz(
        bytes32 metadataHash,
        uint256 maxParticipants,
        uint256 startTime,
        uint256 duration,
        bytes32 correctAnswersHash
    ) external returns (uint256);
    
    function fundQuiz(uint256 quizId) external payable;
    
    function joinQuiz(uint256 quizId) external;
    
    function commitAnswer(uint256 quizId, bytes32 commitment) external;
    
    function revealAnswer(
        uint256 quizId,
        bytes calldata answers,
        bytes32 salt,
        bytes calldata correctAnswers,
        uint256 score
    ) external;
    
    function endQuiz(uint256 quizId) external;
    
    function distributeRewards(uint256 quizId) external;
    
    function getQuiz(uint256 quizId) external view returns (Quiz memory);
    
    function getParticipants(uint256 quizId) external view returns (address[] memory);
    
    function getParticipantData(uint256 quizId, address participant) 
        external 
        view 
        returns (Participant memory);
    
    function getAllQuizIds() external view returns (uint256[] memory);
    
    function cancelQuiz(uint256 quizId) external;
}

