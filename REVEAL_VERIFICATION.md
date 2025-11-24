# Complete Reveal Answer Verification

## Contract Requirements (QuizManager.sol)

```solidity
function revealAnswer(
    uint256 quizId,
    bytes calldata answers,
    bytes32 salt,
    bytes calldata correctAnswers,
    uint256 score
)
```

### Contract Checks:
1. ✅ `block.timestamp >= quiz.endTime` - "Quiz not ended"
2. ✅ `participantData[quizId][msg.sender].hasCommitted` - "Must commit first"
3. ✅ `!participantData[quizId][msg.sender].hasRevealed` - "Already revealed"
4. ✅ `keccak256(abi.encodePacked(answers, salt)) == answerCommitments[quizId][msg.sender]` - "Invalid commitment"
5. ✅ `keccak256(correctAnswers) == correctAnswersHash[quizId]` - "Invalid correct answers"
6. ✅ `QuizLib.calculateScore(answers, correctAnswers) == score` - "Score mismatch"
7. ✅ `score <= answers.length` - "Invalid score"
8. ✅ `userAnswers.length == correctAnswers.length` - "Answer length mismatch" (in calculateScore)

## Frontend Implementation

### 1. Data Preparation (results/page.tsx)

**Answers:**
- Source: localStorage `quiz_{id}_answers_{address}`
- Format: JSON array `[0, 1, 2]`
- Encoding: `JSON.stringify(numericAnswers)` → `TextEncoder.encode()` → `Uint8Array`
- Example: `[0]` → `"[0]"` → `[91, 48, 93]` (3 bytes)

**Salt:**
- Source: localStorage `quiz_{id}_salt_{address}`
- Format: Hex string `0x...`
- Normalization: Clean, pad to 64 hex chars, ensure `0x` prefix
- Final: `0x` + 64 hex characters (66 chars total)

**Correct Answers:**
- Source: IPFS metadata `metadata.questions.map(q => q.correctAnswer)`
- Format: JSON array (same as creation)
- Encoding: `JSON.stringify(correctAnswersArray)` → `TextEncoder.encode()` → `Uint8Array`
- Hash: `keccak256(stringToBytes(correctAnswersString))`

**Score:**
- Calculation: Byte-by-byte comparison (matches contract)
- Formula: Count matching bytes between `answersBytes` and `correctAnswersBytes`
- Validation: `score <= answersBytes.length`

### 2. Pre-Transaction Validation

All checks performed before sending:
- ✅ Quiz has ended
- ✅ User has committed
- ✅ User hasn't revealed
- ✅ Commitment matches
- ✅ Correct answers hash matches
- ✅ Answer lengths match
- ✅ Score is valid

### 3. Hook Implementation (useQuizContract.ts)

**Parameters:**
- `quizId`: `bigint` ✅
- `answers`: `Uint8Array` ✅ (matches `bytes calldata`)
- `salt`: `0x${string}` (66 chars) ✅ (matches `bytes32`)
- `correctAnswers`: `Uint8Array` ✅ (matches `bytes calldata`)
- `score`: `bigint` ✅

**Commitment Calculation:**
```typescript
keccak256(concat([answers, salt]))
```
Matches contract: `keccak256(abi.encodePacked(answers, salt))` ✅

### 4. Contract Call

```typescript
writeContract({
  address: QUIZ_MANAGER_ADDRESS,
  abi: quizManagerAbi,
  functionName: 'revealAnswer',
  args: [
    quizId,              // bigint ✅
    answersArray,        // Uint8Array ✅
    saltFinal,          // 0x${string} (bytes32) ✅
    correctAnswersArray, // Uint8Array ✅
    score               // bigint ✅
  ],
})
```

## Verification Checklist

- [x] Commitment calculation matches contract
- [x] Correct answers hash calculation matches creation
- [x] Score calculation matches contract (byte-by-byte)
- [x] Parameter types match ABI
- [x] All contract requirements validated before sending
- [x] Answer lengths verified to match
- [x] Score validity checked

## Potential Issues

1. **Transaction Status**: Need to check actual transaction receipt to see revert reason
2. **Network Sync**: RPC might be out of sync
3. **Gas Issues**: Transaction might be failing due to gas estimation

## Next Steps

1. Add transaction receipt checking to get actual revert reason
2. Verify transaction is actually being sent (check wallet)
3. Check if transaction is pending or failed in block explorer



