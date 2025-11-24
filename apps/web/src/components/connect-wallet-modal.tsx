'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Wallet, LinkIcon, Smartphone, ExternalLink } from 'lucide-react'

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  if (!isOpen) return null

  const handleConnect = (provider: string) => {
    console.log('[v0] Connecting to:', provider)
    alert(`Connecting to ${provider}...`)
    // In a real app, this would trigger wallet connection
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Your Wallet
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please connect a wallet to access this part of CeloScholar. Your connection will stay active
            across refreshes as long as your wallet session is open.
          </p>

          {/* Wallet Options */}
          <div className="space-y-3">
            {/* MetaMask */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => handleConnect('MetaMask')}
            >
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">MetaMask</div>
                <div className="text-xs text-muted-foreground">
                  Connect to your MetaMask wallet
                </div>
              </div>
            </Button>

            {/* WalletConnect */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => handleConnect('WalletConnect')}
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <LinkIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">WalletConnect</div>
                <div className="text-xs text-muted-foreground">
                  Scan with WalletConnect compatible wallet
                </div>
              </div>
            </Button>

            {/* MiniPay */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => handleConnect('MiniPay')}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">MiniPay</div>
                <div className="text-xs text-muted-foreground">
                  Use Celo's MiniPay for gas-free experience
                </div>
              </div>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-4 border-t border-border">
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              What is a wallet?
              <ExternalLink className="h-3 w-3" />
            </button>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              A wallet lets you interact with Web3 apps and manage your cryptocurrency securely on the blockchain.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
