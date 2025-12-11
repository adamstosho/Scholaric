/**
 * Contract Addresses
 * Update these when deploying to different networks
 */

export const QUIZ_MANAGER_ADDRESS = 
  process.env.NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS || 
  '0x1469beF9638eE24Bdb39835fD3429D45F7833827'; // Celo Mainnet

export const CHAIN_ID = 
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 
  42220; // Celo Mainnet

export const EXPLORER_URL = 
  process.env.NEXT_PUBLIC_EXPLORER_URL || 
  'https://celoscan.io';

