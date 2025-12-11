'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Copy, LogOut, RefreshCw } from 'lucide-react'

interface WalletStatusProps {
  address?: string
  network?: string
  balance?: string
  isConnected?: boolean
}

export function WalletStatus({ 
  address = '0x742d...f44e', 
  network = process.env.NEXT_PUBLIC_NETWORK_NAME || 'Celo Mainnet',
  balance = '125.50',
  isConnected = true
}: WalletStatusProps) {
  if (!isConnected) return null

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address)
    alert('Address copied to clipboard!')
  }

  const handleViewExplorer = () => {
    window.open(`https://explorer.celo.org/address/${address}`, '_blank')
  }

  const handleDisconnect = () => {
    console.log('[v0] Disconnecting wallet...')
    alert('Wallet disconnected')
  }

  const handleSwitchNetwork = () => {
    console.log('[v0] Switching network...')
    alert('Network switch requested')
  }

  return (
    <Card className="border-border">
      <CardContent className="p-4 space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Connected</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {network}
          </Badge>
        </div>

        {/* Address */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Address</div>
            <div className="font-mono text-sm">{address}</div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              title="Copy address"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewExplorer}
              title="View on explorer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Balance</div>
          <div className="text-2xl font-bold text-primary">{balance} cUSD</div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={handleSwitchNetwork}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Switch Network
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDisconnect}
          >
            <LogOut className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
