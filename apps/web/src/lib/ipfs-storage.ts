/**
 * Utility functions for storing and retrieving IPFS hash mappings
 * Since the contract stores keccak256(IPFS hash) as bytes32, we need to
 * store the original IPFS hash mapping locally to retrieve metadata later.
 */

const STORAGE_KEY = 'celoscholar_ipfs_hashes'

interface IpfsHashMap {
  [quizId: string]: string // quizId -> IPFS hash
}

/**
 * Store IPFS hash for a quiz ID
 */
export function storeIpfsHash(quizId: string | bigint, ipfsHash: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const map: IpfsHashMap = stored ? JSON.parse(stored) : {}
    map[String(quizId)] = ipfsHash
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (error) {
    console.error('Error storing IPFS hash:', error)
  }
}

/**
 * Retrieve IPFS hash for a quiz ID
 */
export function getIpfsHash(quizId: string | bigint): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const map: IpfsHashMap = JSON.parse(stored)
    return map[String(quizId)] || null
  } catch (error) {
    console.error('Error retrieving IPFS hash:', error)
    return null
  }
}

/**
 * Get all stored IPFS hash mappings
 */
export function getAllIpfsHashes(): IpfsHashMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error retrieving all IPFS hashes:', error)
    return {}
  }
}

/**
 * Manually set IPFS hash for a quiz (useful for old quizzes)
 */
export function setIpfsHashManually(quizId: string | bigint, ipfsHash: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const map: IpfsHashMap = stored ? JSON.parse(stored) : {}
    map[String(quizId)] = ipfsHash
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    console.log(`Manually set IPFS hash for quiz ${quizId}: ${ipfsHash}`)
  } catch (error) {
    console.error('Error manually setting IPFS hash:', error)
  }
}

