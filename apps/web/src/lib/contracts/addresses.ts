/**
 * Contract Addresses
 * Update these when deploying to different networks
 */

export const QUIZ_MANAGER_ADDRESS = 
  process.env.NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS || 
  '0xc9E6c6990BD99Af280641f659e6543ae9577409c';

export const CHAIN_ID = 
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 
  11142220; // Celo Sepolia

export const EXPLORER_URL = 
  process.env.NEXT_PUBLIC_EXPLORER_URL || 
  'https://celo-sepolia.blockscout.com';

