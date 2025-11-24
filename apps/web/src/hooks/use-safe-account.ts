"use client";

import { useAccount } from "wagmi";

/**
 * Safely use account hook - must be used within WagmiProvider
 * This is a simple wrapper that ensures consistent return type
 */
export function useSafeAccount() {
  const account = useAccount();
  return {
    isConnected: account.isConnected || false,
    address: account.address,
    isConnecting: account.isConnecting || false,
  };
}

