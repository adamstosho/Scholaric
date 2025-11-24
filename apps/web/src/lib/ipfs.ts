/**
 * IPFS Integration for Quiz Metadata Storage
 * Using Pinata for IPFS uploads
 */

export interface QuizMetadata {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  grade: string;
  questions: Question[];
  createdAt: string;
  creator: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  questionText: string;
  options?: string[];
  correctAnswer: string | number;
}

/**
 * Upload quiz metadata to IPFS using Pinata
 */
export async function uploadQuizMetadata(metadata: QuizMetadata): Promise<string> {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT_TOKEN;
  
  if (!pinataJwt) {
    throw new Error('Pinata JWT token not configured. Please set NEXT_PUBLIC_PINATA_JWT_TOKEN in .env.local');
  }

  try {
    // Prepare metadata for Pinata
    const data = JSON.stringify(metadata);
    const blob = new Blob([data], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'quiz-metadata.json');

    // Pinata metadata
    const pinataMetadata = JSON.stringify({
      name: `quiz-${metadata.title}-${Date.now()}`,
    });

    formData.append('pinataMetadata', pinataMetadata);

    // Pinata options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });

    formData.append('pinataOptions', pinataOptions);

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;

    if (!ipfsHash) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    return ipfsHash;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);
    throw new Error(`Failed to upload quiz metadata to IPFS: ${error.message}`);
  }
}

/**
 * Fetch quiz metadata from IPFS
 * Uses CORS-friendly gateways to avoid CORS issues
 */
export async function fetchQuizMetadata(ipfsHash: string): Promise<QuizMetadata> {
  // List of CORS-friendly IPFS gateways to try
  // Note: Pinata gateway removed due to CORS and rate limiting issues
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://dweb.link/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.filebase.io/ipfs/',
  ];
  
  const customGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY;
  if (customGateway) {
    gateways.unshift(customGateway.endsWith('/') ? customGateway : `${customGateway}/`);
  }

  let lastError: Error | null = null;

  // Try each gateway in order
  for (const gateway of gateways) {
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      const url = `${gateway}${ipfsHash}`;
      
      // Create abort controller for timeout (compatible with older browsers)
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      if (timeoutId) clearTimeout(timeoutId);

      if (response.ok) {
        const metadata = await response.json();
        console.log(`✅ Successfully fetched metadata from ${gateway}`);
        return metadata as QuizMetadata;
      } else {
        // Silently continue - non-200 responses are expected for some gateways
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      // Clear timeout if still active
      if (timeoutId) clearTimeout(timeoutId);
      
      // CORS errors or network errors
      if (error.name === 'AbortError') {
        // Silently continue - timeout is expected for some gateways
        lastError = new Error('Request timeout');
      } else if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
        // Silently continue - CORS errors are expected for some gateways (like Pinata)
        // Only log if it's the last gateway (all failed)
        lastError = error;
      } else {
        // Silently continue - network errors are expected for some gateways
        lastError = error;
      }
      // Continue to next gateway
      continue;
    }
  }

  // All gateways failed
  console.error('❌ All IPFS gateways failed. Last error:', lastError);
  throw new Error(`Failed to fetch quiz metadata from IPFS after trying ${gateways.length} gateways. ${lastError?.message || 'Unknown error'}`);
}

/**
 * Calculate hash of correct answers for on-chain verification
 */
export function hashCorrectAnswers(questions: Question[]): string {
  const correctAnswers = questions.map(q => q.correctAnswer);
  const answersString = JSON.stringify(correctAnswers);
  
  // Use ethers.js keccak256 (same as Solidity)
  // This will be done in the frontend when calling the contract
  return answersString;
}

/**
 * Verify Pinata connection
 */
export async function verifyPinataConnection(): Promise<boolean> {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT_TOKEN;
  
  if (!pinataJwt) {
    return false;
  }

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Query Pinata API to get all pins and try to find the IPFS hash for a quiz
 * by matching the keccak256 hash of the IPFS hash with the metadataHash from contract
 */
export async function findIpfsHashByMetadataHash(
  metadataHash: `0x${string}`,
  creatorAddress?: string
): Promise<string | null> {
  const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT_TOKEN;
  
  if (!pinataJwt) {
    console.warn('Pinata JWT token not configured, cannot auto-recover IPFS hash');
    return null;
  }

  try {
    // Query Pinata to get all pins (limit to 1000, should be enough for most cases)
    const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
    });

    if (!response.ok) {
      console.warn('Failed to query Pinata pins:', response.statusText);
      return null;
    }

    const data = await response.json();
    const pins = data.rows || [];

    if (pins.length === 0) {
      console.warn('No pins found in Pinata');
      return null;
    }

    // Import viem functions for hashing
    const { keccak256, stringToBytes } = await import('viem');

    // Try each pin to see if it matches
    for (const pin of pins) {
      const ipfsHash = pin.ipfs_pin_hash;
      if (!ipfsHash) continue;

      try {
        // Calculate keccak256 of the IPFS hash (same way we do when creating quiz)
        const ipfsHashBytes = stringToBytes(ipfsHash);
        const calculatedHash = keccak256(ipfsHashBytes) as `0x${string}`;

        // Check if it matches the metadataHash
        if (calculatedHash.toLowerCase() === metadataHash.toLowerCase()) {
          // Double-check by fetching metadata and verifying creator if provided
          if (creatorAddress) {
            try {
              const metadata = await fetchQuizMetadata(ipfsHash);
              if (metadata.creator?.toLowerCase() === creatorAddress.toLowerCase()) {
                console.log(`✅ Found matching IPFS hash for quiz: ${ipfsHash}`);
                return ipfsHash;
              }
            } catch {
              // If we can't fetch metadata, still return it if hash matches
              console.log(`✅ Found matching IPFS hash (hash match only): ${ipfsHash}`);
              return ipfsHash;
            }
          } else {
            // If no creator address, return on hash match
            console.log(`✅ Found matching IPFS hash: ${ipfsHash}`);
            return ipfsHash;
          }
        }
      } catch (err) {
        // Continue to next pin if this one fails
        continue;
      }
    }

    console.warn('No matching IPFS hash found in Pinata pins');
    return null;
  } catch (error: any) {
    console.error('Error querying Pinata for IPFS hash:', error);
    return null;
  }
}

