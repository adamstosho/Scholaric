/**
 * Contract Addresses
 * Network-aware contract address configuration
 */

// Contract addresses for each network
const CONTRACT_ADDRESSES: Record<number, string> = {
  42220: '0x1469beF9638eE24Bdb39835fD3429D45F7833827', // Celo Mainnet
  44787: process.env.NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS_ALFAJORES || '', // Celo Alfajores
  11142220: process.env.NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS_SEPOLIA || '0xc9E6c6990BD99Af280641f659e6543ae9577409c', // Celo Sepolia
};

// Explorer URLs for each network
const EXPLORER_URLS: Record<number, string> = {
  42220: 'https://celoscan.io',
  44787: 'https://alfajores.celoscan.io',
  11142220: 'https://celo-sepolia.blockscout.com',
};

// Network names
const NETWORK_NAMES: Record<number, string> = {
  42220: 'Celo Mainnet',
  44787: 'Celo Alfajores',
  11142220: 'Celo Sepolia',
};

// Default network (used when chain ID is not provided or unknown)
export const DEFAULT_CHAIN_ID = 
  Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 
  42220; // Celo Mainnet

// Default contract address (for backward compatibility and SSR)
export const QUIZ_MANAGER_ADDRESS = 
  process.env.NEXT_PUBLIC_QUIZ_MANAGER_ADDRESS || 
  CONTRACT_ADDRESSES[DEFAULT_CHAIN_ID] || 
  '0x1469beF9638eE24Bdb39835fD3429D45F7833827';

// Default chain ID (for backward compatibility)
export const CHAIN_ID = DEFAULT_CHAIN_ID;

// Default explorer URL (for backward compatibility)
export const EXPLORER_URL = 
  process.env.NEXT_PUBLIC_EXPLORER_URL || 
  EXPLORER_URLS[DEFAULT_CHAIN_ID] || 
  'https://celoscan.io';

/**
 * Get contract address for a specific chain ID
 * @param chainId - The chain ID to get the contract address for
 * @returns The contract address for the given chain, or default if not found
 */
export function getContractAddress(chainId?: number): `0x${string}` {
  if (!chainId) {
    return QUIZ_MANAGER_ADDRESS as `0x${string}`;
  }
  
  const address = CONTRACT_ADDRESSES[chainId] || QUIZ_MANAGER_ADDRESS;
  if (!address) {
    throw new Error(`No contract address configured for chain ID ${chainId}`);
  }
  return address as `0x${string}`;
}

/**
 * Get explorer URL for a specific chain ID
 * @param chainId - The chain ID to get the explorer URL for
 * @returns The explorer URL for the given chain
 */
export function getExplorerUrl(chainId?: number): string {
  if (!chainId) {
    return EXPLORER_URL;
  }
  return EXPLORER_URLS[chainId] || EXPLORER_URL;
}

/**
 * Get network name for a specific chain ID
 * @param chainId - The chain ID to get the network name for
 * @returns The network name for the given chain
 */
export function getNetworkName(chainId?: number): string {
  if (!chainId) {
    return NETWORK_NAMES[DEFAULT_CHAIN_ID] || 'Celo';
  }
  return NETWORK_NAMES[chainId] || 'Unknown Network';
}

