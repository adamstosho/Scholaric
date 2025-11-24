import { defineChain } from 'viem';

/**
 * Celo Sepolia Testnet Chain Configuration
 * Chain ID: 11142220
 */
export const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: [
        'https://forno.celo-sepolia.celo-testnet.org',
        'https://rpc.ankr.com/celo_sepolia',
        'https://celo-sepolia-rpc.publicnode.com',
      ],
    },
    public: {
      http: [
        'https://forno.celo-sepolia.celo-testnet.org',
        'https://rpc.ankr.com/celo_sepolia',
        'https://celo-sepolia-rpc.publicnode.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://celo-sepolia.blockscout.com',
    },
  },
  testnet: true,
});

