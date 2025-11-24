// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./libraries/QuizLib.sol";

/**
 * @title QuizManager
 * @dev Manages quiz creation, participation, and reward distribution on Celo
 */
contract QuizManager is Ownable, ReentrancyGuard, Pausable {
    uint256 private _quizIds;
    
    enum QuizStatus { Upcoming, Live, Ended, Cancelled }
    
    struct Quiz {
        uint256 quizId;
        address creator;
        bytes32 metadataHash;        // IPFS hash
        uint256 prizePool;           // Total cUSD
        uint256 maxParticipants;
        uint256 startTime;
        uint256 duration;            // In seconds
        uint256 endTime;
        QuizStatus status;
        uint256 participantCount;
        bool isVerified;
        bool rewardsDistributed;     // Prevent double reward claims
    }
    
    struct Participant {
        address participant;
        uint256 joinTime;
        bool hasCommitted;
        bool hasRevealed;
        uint256 score;
        uint256 reward;
    }
    
    // Storage
    mapping(uint256 => Quiz) public quizzes;
    mapping(uint256 => address[]) public participants;
    mapping(uint256 => mapping(address => Participant)) public participantData;
    mapping(uint256 => mapping(address => bytes32)) public answerCommitments;
    mapping(uint256 => mapping(address => bytes)) public answerReveals;
    mapping(uint256 => bytes32) public correctAnswersHash; // Hash of correct answers
    
    // Events
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
    
    // Modifiers
    modifier onlyCreator(uint256 quizId) {
        require(quizzes[quizId].creator == msg.sender, "Not quiz creator");
        _;
    }
    
    modifier quizExists(uint256 quizId) {
        require(quizzes[quizId].quizId != 0, "Quiz does not exist");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new quiz
     * @param metadataHash IPFS hash of quiz metadata
     * @param maxParticipants Maximum number of participants
     * @param startTime Quiz start timestamp
     * @param duration Quiz duration in seconds
     * @param _correctAnswersHash Hash of correct answers (for verification)
     */
    function createQuiz(
        bytes32 metadataHash,
        uint256 maxParticipants,
        uint256 startTime,
        uint256 duration,
        bytes32 _correctAnswersHash
    ) external whenNotPaused returns (uint256) {
        require(maxParticipants > 0, "Invalid max participants");
        require(startTime > block.timestamp, "Start time must be in future");
        require(duration > 0, "Invalid duration");
        
        _quizIds++;
        uint256 newQuizId = _quizIds;
        
        Quiz memory newQuiz = Quiz({
            quizId: newQuizId,
            creator: msg.sender,
            metadataHash: metadataHash,
            prizePool: 0,
            maxParticipants: maxParticipants,
            startTime: startTime,
            duration: duration,
            endTime: startTime + duration,
            status: QuizStatus.Upcoming,
            participantCount: 0,
            isVerified: false,
            rewardsDistributed: false
        });
        
        quizzes[newQuizId] = newQuiz;
        correctAnswersHash[newQuizId] = _correctAnswersHash;
        
        emit QuizCreated(
            newQuizId,
            msg.sender,
            metadataHash,
            startTime,
            maxParticipants
        );
        
        return newQuizId;
    }
    
    /**
     * @dev Fund the prize pool for a quiz
     */
    function fundQuiz(uint256 quizId) 
        external 
        payable 
        quizExists(quizId)
        nonReentrant 
    {
        Quiz storage quiz = quizzes[quizId];
        require(
            quiz.status == QuizStatus.Upcoming || quiz.status == QuizStatus.Live, 
            "Quiz not accepting funds"
        );
        require(msg.value > 0, "Must send cUSD");
        
        quiz.prizePool += msg.value;
        
        emit PrizePoolFunded(quizId, msg.sender, msg.value);
    }
    
    /**
     * @dev Join a quiz
     */
    function joinQuiz(uint256 quizId) 
        external 
        quizExists(quizId)
        whenNotPaused
    {
        Quiz storage quiz = quizzes[quizId];
        require(
            quiz.status == QuizStatus.Upcoming || quiz.status == QuizStatus.Live, 
            "Quiz not accepting participants"
        );
        require(block.timestamp >= quiz.startTime, "Quiz has not started");
        require(block.timestamp < quiz.endTime, "Quiz has ended");
        require(quiz.participantCount < quiz.maxParticipants, "Quiz is full");
        require(
            participantData[quizId][msg.sender].participant == address(0), 
            "Already joined"
        );
        require(
            msg.sender != quiz.creator,
            "Quiz creator cannot participate"
        );
        
        // Update quiz status if needed
        if (quiz.status == QuizStatus.Upcoming && block.timestamp >= quiz.startTime) {
            quiz.status = QuizStatus.Live;
        }
        
        participants[quizId].push(msg.sender);
        quiz.participantCount++;
        
        participantData[quizId][msg.sender] = Participant({
            participant: msg.sender,
            joinTime: block.timestamp,
            hasCommitted: false,
            hasRevealed: false,
            score: 0,
            reward: 0
        });
        
        emit QuizJoined(quizId, msg.sender);
    }
    
    /**
     * @dev Commit answer hash (commit-reveal pattern)
     */
    function commitAnswer(uint256 quizId, bytes32 commitment) 
        external 
        quizExists(quizId)
    {
        Quiz storage quiz = quizzes[quizId];
        require(quiz.status == QuizStatus.Live, "Quiz not live");
        require(block.timestamp >= quiz.startTime, "Quiz has not started");
        require(block.timestamp < quiz.endTime, "Quiz has ended");
        require(
            participantData[quizId][msg.sender].participant != address(0), 
            "Not a participant"
        );
        require(
            !participantData[quizId][msg.sender].hasCommitted, 
            "Already committed"
        );
        
        answerCommitments[quizId][msg.sender] = commitment;
        participantData[quizId][msg.sender].hasCommitted = true;
        
        emit AnswerCommitted(quizId, msg.sender, commitment);
    }
    
    /**
     * @dev Reveal answer after commit period
     * @param quizId The quiz ID
     * @param answers User's answers (encoded)
     * @param salt Random salt used in commitment
     * @param correctAnswers Correct answers from IPFS metadata (for score calculation)
     * @param score Calculated score (verified off-chain from IPFS, passed for efficiency)
     */
    function revealAnswer(
        uint256 quizId,
        bytes calldata answers,
        bytes32 salt,
        bytes calldata correctAnswers,
        uint256 score
    ) 
        external 
        quizExists(quizId)
        nonReentrant
    {
        Quiz storage quiz = quizzes[quizId];
        require(block.timestamp >= quiz.endTime, "Quiz not ended");
        require(
            participantData[quizId][msg.sender].hasCommitted, 
            "Must commit first"
        );
        require(
            !participantData[quizId][msg.sender].hasRevealed, 
            "Already revealed"
        );
        
        // Verify commitment
        bytes32 commitment = keccak256(abi.encodePacked(answers, salt));
        require(
            commitment == answerCommitments[quizId][msg.sender], 
            "Invalid commitment"
        );
        
        // Verify correct answers hash matches stored hash
        bytes32 correctAnswersHashCalculated = keccak256(correctAnswers);
        require(
            correctAnswersHashCalculated == correctAnswersHash[quizId],
            "Invalid correct answers"
        );
        
        // Calculate and verify score
        uint256 calculatedScore = QuizLib.calculateScore(answers, correctAnswers);
        require(calculatedScore == score, "Score mismatch");
        require(score <= answers.length, "Invalid score");
        
        // Store data
        participantData[quizId][msg.sender].hasRevealed = true;
        participantData[quizId][msg.sender].score = score;
        answerReveals[quizId][msg.sender] = answers;
        
        emit AnswerRevealed(quizId, msg.sender, score);
    }
    
    /**
     * @dev End quiz and distribute rewards
     */
    function endQuiz(uint256 quizId) 
        external 
        quizExists(quizId)
        onlyCreator(quizId)
    {
        Quiz storage quiz = quizzes[quizId];
        require(quiz.status == QuizStatus.Live, "Quiz not live");
        require(block.timestamp >= quiz.endTime, "Quiz not ended");
        
        quiz.status = QuizStatus.Ended;
        
        emit QuizEnded(quizId, quiz.participantCount);
    }
    
    /**
     * @dev Distribute rewards based on scores
     */
    function distributeRewards(uint256 quizId) 
        external 
        quizExists(quizId)
        onlyCreator(quizId)
        nonReentrant
    {
        Quiz storage quiz = quizzes[quizId];
        require(quiz.status == QuizStatus.Ended, "Quiz must be ended");
        require(quiz.prizePool > 0, "No prize pool");
        require(!quiz.rewardsDistributed, "Rewards already distributed");
        
        (address[] memory recipients, uint256[] memory amounts) = calculateRewards(quizId);
        
        // Distribute
        for (uint256 i = 0; i < recipients.length; i++) {
            if (amounts[i] > 0) {
                (bool success, ) = recipients[i].call{value: amounts[i]}("");
                require(success, "Transfer failed");
                participantData[quizId][recipients[i]].reward = amounts[i];
            }
        }
        
        // Mark rewards as distributed to prevent double claims
        quiz.rewardsDistributed = true;
        
        emit RewardsDistributed(quizId, recipients, amounts);
    }
    
    /**
     * @dev Calculate score by comparing answers with correct answers
     * @notice This function is kept for backward compatibility but score
     *         is now calculated in revealAnswer using QuizLib.calculateScore
     * @dev This can be removed if not needed elsewhere
     */
    function calculateScore(uint256 quizId, bytes calldata answers) 
        internal 
        view 
        returns (uint256) 
    {
        // This function is deprecated - score calculation is now done
        // in revealAnswer() using QuizLib.calculateScore()
        // Kept for backward compatibility if needed
        
        if (answers.length == 0) {
            return 0;
        }
        
        // Return 0 as placeholder - actual calculation happens in revealAnswer
        return 0;
    }
    
    /**
     * @dev Calculate rewards distribution based on scores
     * @notice Distributes prize pool proportionally based on scores
     */
    function calculateRewards(uint256 quizId) 
        internal 
        view 
        returns (address[] memory, uint256[] memory)
    {
        address[] memory participantList = participants[quizId];
        uint256 totalParticipants = participantList.length;
        
        if (totalParticipants == 0) {
            return (new address[](0), new uint256[](0));
        }
        
        // Collect scores for all participants who revealed
        uint256[] memory scores = new uint256[](totalParticipants);
        address[] memory revealedParticipants = new address[](totalParticipants);
        uint256 revealedCount = 0;
        
        for (uint256 i = 0; i < totalParticipants; i++) {
            address participant = participantList[i];
            Participant memory pData = participantData[quizId][participant];
            
            if (pData.hasRevealed && pData.score > 0) {
                revealedParticipants[revealedCount] = participant;
                scores[revealedCount] = pData.score;
                revealedCount++;
            }
        }
        
        if (revealedCount == 0) {
            return (new address[](0), new uint256[](0));
        }
        
        // Resize arrays to actual revealed count
        address[] memory finalParticipants = new address[](revealedCount);
        uint256[] memory finalScores = new uint256[](revealedCount);
        
        for (uint256 i = 0; i < revealedCount; i++) {
            finalParticipants[i] = revealedParticipants[i];
            finalScores[i] = scores[i];
        }
        
        // Calculate rewards using library
        Quiz storage quiz = quizzes[quizId];
        uint256[] memory rewardAmounts = QuizLib.calculateRewards(
            finalScores,
            quiz.prizePool
        );
        
        return (finalParticipants, rewardAmounts);
    }
    
    /**
     * @dev Get quiz details
     */
    function getQuiz(uint256 quizId) 
        external 
        view 
        returns (Quiz memory) 
    {
        return quizzes[quizId];
    }
    
    /**
     * @dev Get participants for a quiz
     */
    function getParticipants(uint256 quizId) 
        external 
        view 
        returns (address[] memory) 
    {
        return participants[quizId];
    }
    
    /**
     * @dev Get participant data
     */
    function getParticipantData(uint256 quizId, address participant) 
        external 
        view 
        returns (Participant memory) 
    {
        return participantData[quizId][participant];
    }
    
    /**
     * @dev Get all quiz IDs
     * @return Array of all quiz IDs
     */
    function getAllQuizIds() 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalQuizzes = _quizIds;
        uint256[] memory quizIds = new uint256[](totalQuizzes);
        
        for (uint256 i = 0; i < totalQuizzes; i++) {
            quizIds[i] = i + 1;
        }
        
        return quizIds;
    }
    
    /**
     * @dev Cancel a quiz and refund prize pool to creator
     * @param quizId The quiz ID to cancel
     */
    function cancelQuiz(uint256 quizId) 
        external 
        quizExists(quizId)
        onlyCreator(quizId)
        nonReentrant
    {
        Quiz storage quiz = quizzes[quizId];
        require(
            quiz.status == QuizStatus.Upcoming || quiz.status == QuizStatus.Live,
            "Can only cancel upcoming or live quizzes"
        );
        require(
            block.timestamp < quiz.endTime,
            "Cannot cancel ended quiz"
        );
        
        uint256 refundAmount = quiz.prizePool;
        
        // Update status
        quiz.status = QuizStatus.Cancelled;
        
        // Refund prize pool to creator
        if (refundAmount > 0) {
            (bool success, ) = quiz.creator.call{value: refundAmount}("");
            require(success, "Refund failed");
            quiz.prizePool = 0;
        }
        
        emit QuizCancelled(quizId, quiz.creator, refundAmount);
    }
    
    /**
     * @dev Pause contract (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw funds (emergency - only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

