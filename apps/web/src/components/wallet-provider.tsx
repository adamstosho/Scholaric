"use client";

import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider, createConfig, http, useConnect, fallback } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { celoSepolia } from "@/lib/chains/celo-sepolia";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet],
    },
  ],
  {
    appName: "CeloScholar",
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "celo-scholar-app",
  }
);

// Create fallback RPC transports for better reliability
// Add timeout and better error handling for "block is out of range" errors
const celoSepoliaTransport = fallback([
  http('https://forno.celo-sepolia.celo-testnet.org', {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 30000, // 30 second timeout
  }),
  http('https://rpc.ankr.com/celo_sepolia', {
    retryCount: 2,
    retryDelay: 1000,
    timeout: 30000,
  }),
  http('https://celo-sepolia-rpc.publicnode.com', {
    retryCount: 2,
    retryDelay: 1000,
    timeout: 30000,
  }),
]);

const wagmiConfig = createConfig({
  chains: [celo, celoAlfajores, celoSepolia],
  connectors,
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
    [celoSepolia.id]: celoSepoliaTransport,
  },
  ssr: true,
});

const queryClient = new QueryClient();

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { connect, connectors } = useConnect();
  const [hasTriedConnect, setHasTriedConnect] = useState(false);

  useEffect(() => {
    // Check if the app is running inside MiniPay
    // Only try once to avoid infinite connection attempts
    if (
      !hasTriedConnect &&
      typeof window !== "undefined" && 
      window.ethereum && 
      (window.ethereum as any).isMiniPay
    ) {
      setHasTriedConnect(true);
      // Find the injected connector, which is what MiniPay uses
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        // Use setTimeout to avoid calling during render
        setTimeout(() => {
          connect({ connector: injectedConnector }).catch((error) => {
            // Silently handle connection errors
            console.log("MiniPay auto-connect failed:", error);
          });
        }, 100);
      }
    }
  }, [connect, connectors, hasTriedConnect]);

  return <>{children}</>;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Always render providers, but handle SSR properly
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={celoSepolia}
          appInfo={{
            appName: "CeloScholar",
            learnMoreUrl: "https://docs.celo.org",
          }}
          modalSize="compact"
        >
          {mounted ? (
            <WalletProviderInner>{children}</WalletProviderInner>
          ) : (
            children
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
