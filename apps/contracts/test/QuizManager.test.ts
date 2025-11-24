import { expect } from "chai";
import { ethers } from "hardhat";
import { QuizManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { keccak256, toUtf8Bytes, concat, randomBytes, parseEther } from "ethers";

describe("QuizManager", function () {
  let quizManager: QuizManager;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let funder: SignerWithAddress;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    creator = signers[1];
    participant1 = signers[2];
    participant2 = signers[3];
    funder = signers[4];

    const QuizManagerFactory = await ethers.getContractFactory("QuizManager");
    quizManager = await QuizManagerFactory.deploy();
    await quizManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct owner", async function () {
      expect(await quizManager.owner()).to.equal(owner.address);
    });

    it("Should start unpaused", async function () {
      expect(await quizManager.paused()).to.be.false;
    });
  });

  describe("Quiz Creation", function () {
    const metadataHash = keccak256(toUtf8Bytes("test-metadata"));
    const correctAnswersHash = keccak256(toUtf8Bytes("correct-answers"));
    let startTime: number;
    const duration = 3600; // 1 hour
    const maxParticipants = 100;

    beforeEach(async function () {
      startTime = Number(await time.latest()) + 3600; // 1 hour from now
    });

    it("Should create a quiz", async function () {
      const tx = await quizManager
        .connect(creator)
        .createQuiz(
          metadataHash,
          maxParticipants,
          startTime,
          duration,
          correctAnswersHash
        );

      await expect(tx)
        .to.emit(quizManager, "QuizCreated")
        .withArgs(1, creator.address, metadataHash, startTime, maxParticipants);

      const quiz = await quizManager.getQuiz(1);
      expect(quiz.creator).to.equal(creator.address);
      expect(quiz.metadataHash).to.equal(metadataHash);
      expect(quiz.maxParticipants).to.equal(maxParticipants);
      expect(quiz.startTime).to.equal(startTime);
      expect(quiz.duration).to.equal(duration);
      expect(quiz.endTime).to.equal(startTime + duration);
      expect(quiz.prizePool).to.equal(0);
      expect(quiz.participantCount).to.equal(0);
    });

    it("Should reject quiz with zero max participants", async function () {
      await expect(
        quizManager
          .connect(creator)
          .createQuiz(metadataHash, 0, startTime, duration, correctAnswersHash)
      ).to.be.revertedWith("Invalid max participants");
    });

    it("Should reject quiz with past start time", async function () {
      const pastTime = (await time.latest()) - 3600;
      await expect(
        quizManager
          .connect(creator)
          .createQuiz(metadataHash, maxParticipants, pastTime, duration, correctAnswersHash)
      ).to.be.revertedWith("Start time must be in future");
    });

    it("Should reject quiz with zero duration", async function () {
      await expect(
        quizManager
          .connect(creator)
          .createQuiz(metadataHash, maxParticipants, startTime, 0, correctAnswersHash)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should increment quiz ID for each new quiz", async function () {
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, maxParticipants, startTime, duration, correctAnswersHash);

      const quiz2StartTime = startTime + 7200;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, maxParticipants, quiz2StartTime, duration, correctAnswersHash);

      const quiz1 = await quizManager.getQuiz(1);
      const quiz2 = await quizManager.getQuiz(2);

      expect(quiz1.quizId).to.equal(1);
      expect(quiz2.quizId).to.equal(2);
    });
  });

  describe("Prize Pool Funding", function () {
    const metadataHash = keccak256(toUtf8Bytes("test"));
    const correctAnswersHash = keccak256(toUtf8Bytes("answers"));
    let startTime: number;

    beforeEach(async function () {
      startTime = (await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash);
    });

    it("Should allow funding quiz", async function () {
      const fundAmount = parseEther("10");
      await expect(
        quizManager.connect(funder).fundQuiz(1, { value: fundAmount })
      )
        .to.emit(quizManager, "PrizePoolFunded")
        .withArgs(1, funder.address, fundAmount);

      const quiz = await quizManager.getQuiz(1);
      expect(quiz.prizePool).to.equal(fundAmount);
    });

    it("Should allow multiple funders", async function () {
      const amount1 = parseEther("5");
      const amount2 = parseEther("3");

      await quizManager.connect(funder).fundQuiz(1, { value: amount1 });
      await quizManager.connect(participant1).fundQuiz(1, { value: amount2 });

      const quiz = await quizManager.getQuiz(1);
      expect(quiz.prizePool).to.equal(amount1 + amount2);
    });

    it("Should reject funding with zero amount", async function () {
      await expect(
        quizManager.connect(funder).fundQuiz(1, { value: 0 })
      ).to.be.revertedWith("Must send cUSD");
    });

    it("Should reject funding non-existent quiz", async function () {
      await expect(
        quizManager.connect(funder).fundQuiz(999, { value: parseEther("1") })
      ).to.be.revertedWith("Quiz does not exist");
    });
  });

  describe("Quiz Participation", function () {
    const metadataHash = keccak256(toUtf8Bytes("test"));
    const correctAnswersHash = keccak256(toUtf8Bytes("answers"));
    let startTime: number;

    beforeEach(async function () {
      startTime = (await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash);
    });

    it("Should allow joining quiz after start time", async function () {
      await time.increaseTo(startTime);

      await expect(
        quizManager.connect(participant1).joinQuiz(1)
      )
        .to.emit(quizManager, "QuizJoined")
        .withArgs(1, participant1.address);

      const participants = await quizManager.getParticipants(1);
      expect(participants).to.include(participant1.address);
      expect(participants.length).to.equal(1);

      const quiz = await quizManager.getQuiz(1);
      expect(quiz.participantCount).to.equal(1);
      expect(quiz.status).to.equal(1); // Live
    });

    it("Should prevent joining before start time", async function () {
      await expect(
        quizManager.connect(participant1).joinQuiz(1)
      ).to.be.revertedWith("Quiz has not started");
    });

    it("Should prevent joining full quiz", async function () {
      // Create quiz with max 1 participant
      const quiz2StartTime = (await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 1, quiz2StartTime, 3600, correctAnswersHash);

      await time.increaseTo(quiz2StartTime);

      await quizManager.connect(participant1).joinQuiz(2);

      await expect(
        quizManager.connect(participant2).joinQuiz(2)
      ).to.be.revertedWith("Quiz is full");
    });

    it("Should prevent double joining", async function () {
      await time.increaseTo(startTime);
      await quizManager.connect(participant1).joinQuiz(1);

      await expect(
        quizManager.connect(participant1).joinQuiz(1)
      ).to.be.revertedWith("Already joined");
    });
  });

  describe("Answer Commit-Reveal", function () {
    const metadataHash = keccak256(toUtf8Bytes("test"));
    // Use "1,2,3" as correct answers for testing
    const correctAnswersForHash = toUtf8Bytes("1,2,3");
    const correctAnswersHash = keccak256(correctAnswersForHash);
    let startTime: number;
    let endTime: number;

    beforeEach(async function () {
      startTime = Number(await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash);

      await time.increaseTo(startTime);
      await quizManager.connect(participant1).joinQuiz(1);
      endTime = startTime + 3600;
    });

    it("Should commit answer", async function () {
      const answers = toUtf8Bytes("1,2,3");
      const salt = randomBytes(32);
      const commitment = keccak256(
        concat([answers, salt])
      );

      await expect(
        quizManager.connect(participant1).commitAnswer(1, commitment)
      )
        .to.emit(quizManager, "AnswerCommitted")
        .withArgs(1, participant1.address, commitment);

      const participantData = await quizManager.getParticipantData(1, participant1.address);
      expect(participantData.hasCommitted).to.be.true;
    });

    it("Should reveal answer after quiz ends", async function () {
      const answers = toUtf8Bytes("1,2,3");
      const correctAnswers = toUtf8Bytes("1,2,3"); // Matches the hash
      const salt = randomBytes(32);
      const commitment = keccak256(
        concat([answers, salt])
      );

      await quizManager.connect(participant1).commitAnswer(1, commitment);

      // Fast forward to end of quiz
      await time.increaseTo(endTime + 1);

      // End quiz first (quiz is already live from joinQuiz above)
      await quizManager.connect(creator).endQuiz(1);

      // Calculate score - QuizLib.calculateScore compares bytes byte-by-byte
      // "1,2,3" is 5 bytes (0x31, 0x2c, 0x32, 0x2c, 0x33)
      // Since all bytes match, score = 5
      const score = 5;

      // Reveal
      await expect(
        quizManager.connect(participant1).revealAnswer(1, answers, salt, correctAnswers, score)
      )
        .to.emit(quizManager, "AnswerRevealed")
        .withArgs(1, participant1.address, score);

      const participantData = await quizManager.getParticipantData(1, participant1.address);
      expect(participantData.hasRevealed).to.be.true;
      expect(participantData.score).to.equal(score);
    });

    it("Should reject invalid commitment on reveal", async function () {
      const answers = toUtf8Bytes("1,2,3");
      const correctAnswers = toUtf8Bytes("1,2,3");
      const salt = randomBytes(32);
      const commitment = keccak256(
        concat([answers, salt])
      );

      await quizManager.connect(participant1).commitAnswer(1, commitment);

      await time.increaseTo(endTime + 1);
      await quizManager.connect(creator).endQuiz(1);

      // Try to reveal with wrong salt
      const wrongSalt = randomBytes(32);
      // Score would be 5 if commitment was valid, but we're testing invalid commitment
      await expect(
        quizManager.connect(participant1).revealAnswer(1, answers, wrongSalt, correctAnswers, 5)
      ).to.be.revertedWith("Invalid commitment");
    });
  });

  describe("Quiz Management", function () {
    const metadataHash = keccak256(toUtf8Bytes("test"));
    const correctAnswersHash = keccak256(toUtf8Bytes("answers"));
    let startTime: number;
    let endTime: number;

    beforeEach(async function () {
      startTime = (await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash);
      endTime = startTime + 3600;
    });

    it("Should allow creator to end quiz", async function () {
      // Start quiz by joining
      await time.increaseTo(startTime);
      await quizManager.connect(participant1).joinQuiz(1);
      
      await time.increaseTo(endTime + 1);

      await expect(
        quizManager.connect(creator).endQuiz(1)
      )
        .to.emit(quizManager, "QuizEnded")
        .withArgs(1, 1);

      const quiz = await quizManager.getQuiz(1);
      expect(quiz.status).to.equal(2); // Ended
    });

    it("Should prevent non-creator from ending quiz", async function () {
      await time.increaseTo(endTime + 1);

      await expect(
        quizManager.connect(participant1).endQuiz(1)
      ).to.be.revertedWith("Not quiz creator");
    });
  });

  describe("Quiz Cancellation", function () {
    const metadataHash = keccak256(toUtf8Bytes("test"));
    const correctAnswersHash = keccak256(toUtf8Bytes("answers"));
    let startTime: number;

    beforeEach(async function () {
      startTime = (await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash);
    });

    it("Should allow creator to cancel quiz", async function () {
      const fundAmount = parseEther("5");
      await quizManager.connect(funder).fundQuiz(1, { value: fundAmount });

      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);

      const tx = await quizManager.connect(creator).cancelQuiz(1);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      await expect(tx)
        .to.emit(quizManager, "QuizCancelled")
        .withArgs(1, creator.address, fundAmount);

      const quiz = await quizManager.getQuiz(1);
      expect(quiz.status).to.equal(3); // Cancelled
      expect(quiz.prizePool).to.equal(0);

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      expect(creatorBalanceAfter).to.equal(creatorBalanceBefore + fundAmount - gasUsed);
    });

    it("Should prevent non-creator from cancelling", async function () {
      await expect(
        quizManager.connect(participant1).cancelQuiz(1)
      ).to.be.revertedWith("Not quiz creator");
    });

    it("Should prevent cancelling ended quiz", async function () {
      await time.increaseTo(startTime);
      await quizManager.connect(participant1).joinQuiz(1);
      await time.increaseTo(startTime + 3601);
      await quizManager.connect(creator).endQuiz(1);

      await expect(
        quizManager.connect(creator).cancelQuiz(1)
      ).to.be.revertedWith("Can only cancel upcoming or live quizzes");
    });
  });

  describe("Get All Quiz IDs", function () {
    it("Should return empty array when no quizzes", async function () {
      const quizIds = await quizManager.getAllQuizIds();
      expect(quizIds.length).to.equal(0);
    });

    it("Should return all quiz IDs", async function () {
      const metadataHash = keccak256(toUtf8Bytes("test"));
      const correctAnswersHash = keccak256(toUtf8Bytes("answers"));
      const startTime = (await time.latest()) + 3600;

      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash);

      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime + 7200, 3600, correctAnswersHash);

      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime + 14400, 3600, correctAnswersHash);

      const quizIds = await quizManager.getAllQuizIds();
      expect(quizIds.length).to.equal(3);
      expect(quizIds[0]).to.equal(1);
      expect(quizIds[1]).to.equal(2);
      expect(quizIds[2]).to.equal(3);
    });
  });

  describe("Reward Distribution", function () {
    const metadataHash = keccak256(toUtf8Bytes("test"));
    const correctAnswersForHash = toUtf8Bytes("1,2,3");
    const correctAnswersHash = keccak256(correctAnswersForHash);
    let startTime: number;
    let endTime: number;

    beforeEach(async function () {
      startTime = Number(await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash);

      // Fund quiz
      await quizManager.connect(funder).fundQuiz(1, { value: parseEther("100") });

      // Start quiz
      await time.increaseTo(startTime);
      await quizManager.connect(participant1).joinQuiz(1);
      await quizManager.connect(participant2).joinQuiz(1);
      endTime = startTime + 3600;
    });

    it("Should distribute rewards proportionally", async function () {
      // Commit and reveal answers
      const answers1 = toUtf8Bytes("1,2,3"); // Score: 5
      const answers2 = toUtf8Bytes("1,2,4"); // Score: 4 (one byte different)
      const correctAnswers = toUtf8Bytes("1,2,3");
      const salt1 = randomBytes(32);
      const salt2 = randomBytes(32);
      const commitment1 = keccak256(concat([answers1, salt1]));
      const commitment2 = keccak256(concat([answers2, salt2]));

      await quizManager.connect(participant1).commitAnswer(1, commitment1);
      await quizManager.connect(participant2).commitAnswer(1, commitment2);

      // End quiz and reveal
      await time.increaseTo(endTime + 1);
      await quizManager.connect(creator).endQuiz(1);

      await quizManager.connect(participant1).revealAnswer(1, answers1, salt1, correctAnswers, 5);
      await quizManager.connect(participant2).revealAnswer(1, answers2, salt2, correctAnswers, 4);

      // Get balances before distribution
      const balance1Before = await ethers.provider.getBalance(participant1.address);
      const balance2Before = await ethers.provider.getBalance(participant2.address);

      // Distribute rewards
      const tx = await quizManager.connect(creator).distributeRewards(1);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      // Check balances after
      const balance1After = await ethers.provider.getBalance(participant1.address);
      const balance2After = await ethers.provider.getBalance(participant2.address);

      // Total score = 5 + 4 = 9
      // Participant 1: (100 * 5) / 9 = ~55.56 CELO
      // Participant 2: (100 * 4) / 9 = ~44.44 CELO
      const expectedReward1 = (parseEther("100") * BigInt(5)) / BigInt(9);
      const expectedReward2 = (parseEther("100") * BigInt(4)) / BigInt(9);

      expect(balance1After - balance1Before).to.equal(expectedReward1);
      expect(balance2After - balance2Before).to.equal(expectedReward2);

      // Check participant data
      const p1Data = await quizManager.getParticipantData(1, participant1.address);
      const p2Data = await quizManager.getParticipantData(1, participant2.address);
      expect(p1Data.reward).to.equal(expectedReward1);
      expect(p2Data.reward).to.equal(expectedReward2);
    });

    it("Should reject distribution before quiz ends", async function () {
      await expect(
        quizManager.connect(creator).distributeRewards(1)
      ).to.be.revertedWith("Quiz must be ended");
    });

    it("Should reject distribution with zero prize pool", async function () {
      // Create quiz without funding
      const quiz2StartTime = Number(await time.latest()) + 3600;
      await quizManager
        .connect(creator)
        .createQuiz(metadataHash, 100, quiz2StartTime, 3600, correctAnswersHash);

      await time.increaseTo(quiz2StartTime);
      await quizManager.connect(participant1).joinQuiz(2);
      await time.increaseTo(quiz2StartTime + 3601);
      await quizManager.connect(creator).endQuiz(2);

      await expect(
        quizManager.connect(creator).distributeRewards(2)
      ).to.be.revertedWith("No prize pool");
    });

    it("Should reject distribution by non-creator", async function () {
      await time.increaseTo(endTime + 1);
      await quizManager.connect(creator).endQuiz(1);

      await expect(
        quizManager.connect(participant1).distributeRewards(1)
      ).to.be.revertedWith("Not quiz creator");
    });

    it("Should handle participants with zero scores", async function () {
      // Participant with completely wrong answers
      // "9,9,9" vs "1,2,3" - comparing byte by byte:
      // 0x39 vs 0x31 (no match), 0x2c vs 0x2c (match), 0x39 vs 0x32 (no match), 
      // 0x2c vs 0x2c (match), 0x39 vs 0x33 (no match)
      // So score = 2 (commas match)
      // Let's use completely different bytes for score 0
      const wrongAnswers = toUtf8Bytes("abcde");
      const correctAnswers = toUtf8Bytes("1,2,3");
      const salt = randomBytes(32);
      const commitment = keccak256(concat([wrongAnswers, salt]));

      await quizManager.connect(participant1).commitAnswer(1, commitment);

      await time.increaseTo(endTime + 1);
      await quizManager.connect(creator).endQuiz(1);

      // Calculate actual score: "abcde" vs "1,2,3" - no bytes match, score = 0
      const actualScore = 0;
      await quizManager.connect(participant1).revealAnswer(1, wrongAnswers, salt, correctAnswers, actualScore);

      // Distribute - participant with 0 score should get 0 reward
      await quizManager.connect(creator).distributeRewards(1);

      const p1Data = await quizManager.getParticipantData(1, participant1.address);
      expect(p1Data.reward).to.equal(0);
    });

    it("Should emit RewardsDistributed event", async function () {
      const answers = toUtf8Bytes("1,2,3");
      const correctAnswers = toUtf8Bytes("1,2,3");
      const salt = randomBytes(32);
      const commitment = keccak256(concat([answers, salt]));

      await quizManager.connect(participant1).commitAnswer(1, commitment);

      await time.increaseTo(endTime + 1);
      await quizManager.connect(creator).endQuiz(1);
      await quizManager.connect(participant1).revealAnswer(1, answers, salt, correctAnswers, 5);

      await expect(
        quizManager.connect(creator).distributeRewards(1)
      )
        .to.emit(quizManager, "RewardsDistributed")
        .withArgs(1, [participant1.address], [parseEther("100")]);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to pause", async function () {
      await quizManager.connect(owner).pause();
      expect(await quizManager.paused()).to.be.true;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        quizManager.connect(creator).pause()
      ).to.be.reverted;
    });

    it("Should prevent operations when paused", async function () {
      await quizManager.connect(owner).pause();

      const metadataHash = keccak256(toUtf8Bytes("test"));
      const correctAnswersHash = keccak256(toUtf8Bytes("answers"));
      const startTime = (await time.latest()) + 3600;

      await expect(
        quizManager
          .connect(creator)
          .createQuiz(metadataHash, 100, startTime, 3600, correctAnswersHash)
      ).to.be.revertedWithCustomError(quizManager, "EnforcedPause");
    });
  });
});

