'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ConnectButton } from '@/components/connect-button'
import { usePathname } from 'next/navigation'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isConnected } = useSafeAccount()
  const pathname = usePathname()

  // Handle scroll effect with throttling for better performance
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check if we're on the landing page
  const isLandingPage = pathname === '/'

  // Landing page navigation (simpler, marketing-focused - no quiz access without wallet)
  const landingNavLinks: Array<{ href: string; label: string; isAnchor?: boolean }> = [
    { href: '#features', label: 'Features', isAnchor: true },
    { href: '#how-it-works', label: 'How It Works', isAnchor: true },
    { href: '#testimonials', label: 'Testimonials', isAnchor: true },
  ]

  // App navigation (for authenticated users on app pages)
  const baseNavLinks: Array<{ href: string; label: string; isAnchor?: boolean }> = [
    { href: '/catalogue', label: 'Catalogue' },
  ]

  const walletNavLinks: Array<{ href: string; label: string; isAnchor?: boolean }> = isConnected ? [
    { href: '/create', label: 'Create Quiz' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/rewards', label: 'Rewards' },
  ] : []

  // Use landing navigation on home page, app navigation elsewhere
  const navLinks = isLandingPage ? landingNavLinks : [...baseNavLinks, ...walletNavLinks]

  return (
    <>
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500 ease-out border-b",
          scrolled 
            ? "bg-background/95 backdrop-blur-md border-border shadow-elevation-1" 
            : "bg-background/50 backdrop-blur-sm border-transparent"
        )}
      >
        <nav className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link 
            href={isConnected ? "/dashboard" : "/"} 
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          >
            <Logo showText={true} size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link, index) => {
              const isActive = link.isAnchor 
                ? false 
                : pathname === link.href
              
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (link.isAnchor) {
                      e.preventDefault()
                      const element = document.querySelector(link.href)
                      if (element) {
                        const headerOffset = 80
                        const elementPosition = element.getBoundingClientRect().top
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        })
                      }
                    }
                  }}
                  className={cn(
                    "text-sm font-medium transition-all duration-300 hover:text-primary relative py-2 px-1 group animate-fade-in",
                    "hover:scale-105",
                    isActive 
                      ? "text-foreground font-semibold" 
                      : "text-muted-foreground"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full",
                    isActive ? "w-full" : "w-0"
                  )} />
                </Link>
              )
            })}
          </div>

          {/* Wallet Button */}
          <div className="hidden md:flex items-center gap-3">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white dark:bg-slate-950 shadow-lg absolute w-full left-0 animate-slide-in-up z-50">
            <div className="container mx-auto py-6 px-4 flex flex-col gap-3">
              {navLinks.map((link, index) => {
                const isActive = link.isAnchor 
                  ? false 
                  : pathname === link.href
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      setMobileMenuOpen(false)
                      if (link.isAnchor) {
                        e.preventDefault()
                        const element = document.querySelector(link.href)
                        if (element) {
                          const headerOffset = 80
                          const elementPosition = element.getBoundingClientRect().top
                          const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                          })
                        }
                      }
                    }}
                    className={cn(
                      "text-base font-semibold p-4 rounded-lg transition-all duration-300 animate-fade-in block",
                      "active:scale-95",
                      isActive 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100" 
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
              <div className="w-full px-2">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
