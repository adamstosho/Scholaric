import Link from 'next/link'
import { Github, Twitter, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/logo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center mb-4 hover:opacity-80 transition-opacity">
              <Logo showText={true} size="md" />
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Decentralized learn-to-earn platform on the Celo blockchain.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/catalogue" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  Browse Quizzes
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  Create Quiz
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  Rewards
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  About Celo
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  Wallet Setup
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Community</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 hover:translate-x-1">
                  <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 hover:translate-x-1">
                  <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 hover:translate-x-1">
                  <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-muted-foreground">
              &copy; 2025 Scholaric. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
