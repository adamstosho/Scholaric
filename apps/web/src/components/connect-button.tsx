"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { celo, celoAlfajores } from "wagmi/chains";
import { celoSepolia } from "@/lib/chains/celo-sepolia";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CHAIN_ID } from "@/lib/contracts/addresses";

interface ConnectButtonProps {
  className?: string;
  redirectToDashboard?: boolean;
}

export function ConnectButton({ className, redirectToDashboard = false }: ConnectButtonProps) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [isMinipay, setIsMinipay] = useState(false);
  const hasSwitchedRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if MiniPay is available
    if (typeof window !== "undefined" && window.ethereum) {
      setIsMinipay((window.ethereum as any).isMiniPay === true);
    }
  }, []);

  useEffect(() => {
    // Auto-switch to configured Celo network if connected to wrong network
    // Only switch once per connection to avoid infinite loops
    if (
      isConnected && 
      chainId && 
      !isSwitching &&
      !hasSwitchedRef.current &&
      chainId !== CHAIN_ID // Check against configured chain ID
    ) {
      hasSwitchedRef.current = true;
      // Determine target chain based on configured CHAIN_ID
      let targetChain = celo; // Default to mainnet
      if (CHAIN_ID === celo.id) targetChain = celo;
      else if (CHAIN_ID === celoAlfajores.id) targetChain = celoAlfajores;
      else if (CHAIN_ID === celoSepolia.id) targetChain = celoSepolia;
      
      // Use setTimeout to avoid calling during render
      setTimeout(() => {
        switchChain(
          { chainId: targetChain.id },
          {
            onError: (error) => {
              // Silently handle error - user can manually switch if needed
              hasSwitchedRef.current = false; // Reset on error to allow retry
            },
            onSuccess: () => {
              // Reset after successful switch to allow future switches if needed
              setTimeout(() => {
                hasSwitchedRef.current = false;
              }, 2000);
            },
          }
        );
      }, 100);
    }

    // Reset switch flag when disconnected
    if (!isConnected) {
      hasSwitchedRef.current = false;
      hasRedirectedRef.current = false;
    }
  }, [isConnected, chainId, isSwitching]);

  // Handle redirect to dashboard after connection (only from landing page)
  // Note: The landing page also handles redirect, but this provides immediate feedback
  useEffect(() => {
    if (
      redirectToDashboard &&
      isConnected &&
      address && // Ensure we have an address, not just isConnected
      !hasRedirectedRef.current &&
      pathname === '/'
    ) {
      hasRedirectedRef.current = true;
      // Immediate redirect since landing page also handles it
      const redirectTimer = setTimeout(() => {
        // Double-check connection is still active before redirecting
        if (isConnected && address) {
          router.replace('/dashboard');
        } else {
          // Reset if connection was lost
          hasRedirectedRef.current = false;
        }
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isConnected, address, redirectToDashboard, router, pathname]);

  // Handle redirect to landing page when wallet disconnects
  useEffect(() => {
    // Only redirect if we were connected and now disconnected
    // Avoid redirecting if already on landing page
    if (!isConnected && pathname !== '/') {
      // Small delay to ensure disconnect is complete
      const redirectTimer = setTimeout(() => {
        router.replace('/');
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isConnected, pathname, router]);

  return (
    <div className={cn("rk-connect-button-wrapper", className)}>
      <RainbowKitConnectButton chainStatus="icon" showBalance={false} />
    </div>
  );
}
