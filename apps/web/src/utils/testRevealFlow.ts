/**
 * Test utility to verify the reveal answer flow
 * This helps debug issues by checking each step
 */

import { keccak256, stringToBytes, concat } from 'viem'
import { TextEncoder } from 'util'

export interface RevealFlowTestResult {
  step: string
  passed: boolean
  message: string
  data?: any
}

/**
 * Test the complete reveal flow
 */
export async function testRevealFlow(
  answers: number[],
  salt: string,
  correctAnswers: number[],
  storedCommitment: string,
  storedCorrectAnswersHash: string
): Promise<RevealFlowTestResult[]> {
  const results: RevealFlowTestResult[] = []

  // Step 1: Verify answers format
  try {
    const numericAnswers = answers.map((a: any) => typeof a === 'string' ? parseInt(a, 10) : a)
    const answersJsonString = JSON.stringify(numericAnswers)
    const textEncoder = new TextEncoder()
    const answersBytes = textEncoder.encode(answersJsonString)
    
    results.push({
      step: '1. Answers Format',
      passed: true,
      message: `Answers formatted correctly: ${answersJsonString}`,
      data: { answersJsonString, answersBytesLength: answersBytes.length, answersBytes: Array.from(answersBytes) }
    })
  } catch (err: any) {
    results.push({
      step: '1. Answers Format',
      passed: false,
      message: `Failed to format answers: ${err.message}`,
      data: { error: err }
    })
    return results // Can't continue if this fails
  }

  // Step 2: Verify salt format
  try {
    let saltStr = String(salt).trim()
    if (!saltStr.startsWith('0x')) saltStr = '0x' + saltStr
    const cleanHex = saltStr.slice(2).replace(/[^0-9a-fA-F]/g, '').toLowerCase()
    let normalizedHex = cleanHex
    if (normalizedHex.length < 64) normalizedHex = normalizedHex.padStart(64, '0')
    else if (normalizedHex.length > 64) normalizedHex = normalizedHex.slice(0, 64)
    const normalizedSalt = ('0x' + normalizedHex) as `0x${string}`
    
    results.push({
      step: '2. Salt Format',
      passed: normalizedSalt.length === 66,
      message: `Salt normalized: ${normalizedSalt} (length: ${normalizedSalt.length})`,
      data: { normalizedSalt, length: normalizedSalt.length }
    })
  } catch (err: any) {
    results.push({
      step: '2. Salt Format',
      passed: false,
      message: `Failed to format salt: ${err.message}`,
      data: { error: err }
    })
    return results
  }

  // Step 3: Verify correct answers format
  try {
    const correctAnswersString = JSON.stringify(correctAnswers)
    const textEncoder = new TextEncoder()
    const correctAnswersBytes = textEncoder.encode(correctAnswersString)
    
    results.push({
      step: '3. Correct Answers Format',
      passed: true,
      message: `Correct answers formatted: ${correctAnswersString}`,
      data: { correctAnswersString, correctAnswersBytesLength: correctAnswersBytes.length }
    })
  } catch (err: any) {
    results.push({
      step: '3. Correct Answers Format',
      passed: false,
      message: `Failed to format correct answers: ${err.message}`,
      data: { error: err }
    })
    return results
  }

  // Step 4: Verify commitment calculation
  try {
    const numericAnswers = answers.map((a: any) => typeof a === 'string' ? parseInt(a, 10) : a)
    const answersJsonString = JSON.stringify(numericAnswers)
    const textEncoder = new TextEncoder()
    const answersBytes = textEncoder.encode(answersJsonString)
    
    let saltStr = String(salt).trim()
    if (!saltStr.startsWith('0x')) saltStr = '0x' + saltStr
    const cleanHex = saltStr.slice(2).replace(/[^0-9a-fA-F]/g, '').toLowerCase()
    let normalizedHex = cleanHex
    if (normalizedHex.length < 64) normalizedHex = normalizedHex.padStart(64, '0')
    else if (normalizedHex.length > 64) normalizedHex = normalizedHex.slice(0, 64)
    const normalizedSalt = ('0x' + normalizedHex) as `0x${string}`
    
    const calculatedCommitment = keccak256(concat([answersBytes, normalizedSalt]))
    const matches = calculatedCommitment.toLowerCase() === storedCommitment.toLowerCase()
    
    results.push({
      step: '4. Commitment Calculation',
      passed: matches,
      message: matches 
        ? 'Commitment matches!' 
        : `Commitment mismatch! Calculated: ${calculatedCommitment}, Stored: ${storedCommitment}`,
      data: { calculatedCommitment, storedCommitment, matches }
    })
  } catch (err: any) {
    results.push({
      step: '4. Commitment Calculation',
      passed: false,
      message: `Failed to calculate commitment: ${err.message}`,
      data: { error: err }
    })
  }

  // Step 5: Verify correct answers hash
  try {
    const correctAnswersString = JSON.stringify(correctAnswers)
    const calculatedHash = keccak256(stringToBytes(correctAnswersString))
    const matches = calculatedHash.toLowerCase() === storedCorrectAnswersHash.toLowerCase()
    
    results.push({
      step: '5. Correct Answers Hash',
      passed: matches,
      message: matches 
        ? 'Correct answers hash matches!' 
        : `Hash mismatch! Calculated: ${calculatedHash}, Stored: ${storedCorrectAnswersHash}`,
      data: { calculatedHash, storedCorrectAnswersHash, matches, correctAnswersString }
    })
  } catch (err: any) {
    results.push({
      step: '5. Correct Answers Hash',
      passed: false,
      message: `Failed to calculate hash: ${err.message}`,
      data: { error: err }
    })
  }

  // Step 6: Verify score calculation
  try {
    const numericAnswers = answers.map((a: any) => typeof a === 'string' ? parseInt(a, 10) : a)
    const answersJsonString = JSON.stringify(numericAnswers)
    const correctAnswersString = JSON.stringify(correctAnswers)
    const textEncoder = new TextEncoder()
    const answersBytes = textEncoder.encode(answersJsonString)
    const correctAnswersBytes = textEncoder.encode(correctAnswersString)
    
    // Check lengths match
    const lengthsMatch = answersBytes.length === correctAnswersBytes.length
    
    // Calculate score
    let score = 0
    if (lengthsMatch) {
      for (let i = 0; i < answersBytes.length; i++) {
        if (answersBytes[i] === correctAnswersBytes[i]) {
          score++
        }
      }
    }
    
    const scoreValid = score <= answersBytes.length
    
    results.push({
      step: '6. Score Calculation',
      passed: lengthsMatch && scoreValid,
      message: lengthsMatch 
        ? `Score calculated: ${score} (valid: ${scoreValid})` 
        : `Answer length mismatch! Answers: ${answersBytes.length}, Correct: ${correctAnswersBytes.length}`,
      data: { 
        score, 
        answersLength: answersBytes.length, 
        correctAnswersLength: correctAnswersBytes.length,
        lengthsMatch,
        scoreValid
      }
    })
  } catch (err: any) {
    results.push({
      step: '6. Score Calculation',
      passed: false,
      message: `Failed to calculate score: ${err.message}`,
      data: { error: err }
    })
  }

  return results
}

/**
 * Print test results in a readable format
 */
export function printTestResults(results: RevealFlowTestResult[]) {
  console.log('\n🧪 REVEAL FLOW TEST RESULTS\n')
  console.log('='.repeat(60))
  
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.step}`)
    console.log(`   ${result.message}`)
    if (result.data) {
      console.log(`   Data:`, result.data)
    }
    console.log('')
  })
  
  console.log('='.repeat(60))
  const allPassed = results.every(r => r.passed)
  console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`)
  
  return allPassed
}






