'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, Coins, Users, Shield, Zap, Trophy, ArrowRight, CheckCircle, Star, Play, Sparkles, Target, Rocket, GraduationCap, Award, TrendingUp } from 'lucide-react'
import { ConnectButton } from '@/components/connect-button'
import { useSafeAccount } from '@/hooks/use-safe-account'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ScrollAnimation } from '@/components/scroll-animation'

export default function Home() {
  const { isConnected, address } = useSafeAccount()
  const router = useRouter()

  // Redirect to dashboard if wallet is already connected
  useEffect(() => {
    if (isConnected && address) {
      // Small delay to prevent flash of landing page
      const timer = setTimeout(() => {
        router.replace('/dashboard')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isConnected, address, router])

  // Show loading state while checking connection
  if (isConnected && address) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
<main className="flex-1">
        {/* Hero Section - Modern Side-by-Side Layout */}
        <section className="relative overflow-hidden pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-12 md:pb-16 min-h-[450px] sm:min-h-[500px] md:min-h-[550px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center max-w-7xl mx-auto">
              
              {/* Left Side - Content */}
              <div className="space-y-4 sm:space-y-5 text-center lg:text-left animate-fade-in">
        {/* Badge with animated icon */}
                <div className="flex justify-center lg:justify-start animate-fade-in">
                <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all hover:scale-105 relative overflow-hidden group">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-float" />
                  <span className="text-primary font-medium relative z-10">Powered by Celo & MiniPay</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </Badge>
        </div>

              {/* Main Headline with animated gradient */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-balance animate-fade-in-delay-1 relative">
                Learn & Earn with Scholaric
                <span className="text-gradient relative inline-block">
                  <span className="relative z-10">cUSD Rewards</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 opacity-20 blur-xl animate-pulse-glow-large" />
                </span>
        </h1>

              {/* Subheadline */}
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed text-balance animate-fade-in-delay-2">
                Create educational quizzes, fund prize pools, and earn stable Celo Dollars for correct answers. Join the decentralized learning revolution where knowledge pays.
              </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1 animate-fade-in-delay-2">
                  {isConnected ? (
                    <>
                      <Button size="lg" className="gap-2 shadow-glow hover:shadow-elevation-2 transition-all px-5 sm:px-6 py-4 sm:py-5 text-sm btn-press w-full sm:w-auto" asChild>
                        <Link href="/catalogue">
                          <Rocket className="h-4 w-4" />
                          Explore Quizzes
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="gap-2 px-5 sm:px-6 py-4 sm:py-5 text-sm border-primary/20 hover:border-primary/50 hover:bg-primary/5 btn-press w-full sm:w-auto" asChild>
                        <Link href="/create">
                          <Play className="h-4 w-4" />
                          Create Quiz
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <div className="text-center lg:text-left w-full">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">Connect your wallet to explore quizzes and start earning</p>
                    </div>
                  )}
                </div>

                {/* Connect Wallet Section */}
                {!isConnected && (
                  <div className="flex flex-col items-center lg:items-start gap-3 pt-1 animate-fade-in-delay-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">Connect your wallet to get started</p>
                    <ConnectButton redirectToDashboard={true} />
                  </div>
                )}
                
                {/* Stats Grid - Compact Horizontal Layout */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 sm:pt-5 max-w-lg mx-auto lg:mx-0 stagger-children">
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/50 transition-all card-hover relative overflow-hidden group">
                    <div className="absolute top-1 right-1 w-8 h-8 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors animate-float" />
                    <div className="relative z-10">
                      <div className="flex flex-col items-center gap-0.5 mb-0.5">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/60 animate-float" style={{ animationDelay: '0.1s' }} />
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary animate-fade-in">1K+</div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Learners</div>
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/50 transition-all card-hover relative overflow-hidden group">
                    <div className="absolute top-1 right-1 w-8 h-8 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors animate-float-reverse" style={{ animationDelay: '0.3s' }} />
                    <div className="relative z-10">
                      <div className="flex flex-col items-center gap-0.5 mb-0.5">
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/60 animate-float-reverse" style={{ animationDelay: '0.2s' }} />
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary animate-fade-in">500+</div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Quizzes</div>
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/50 transition-all card-hover relative overflow-hidden group">
                    <div className="absolute top-1 right-1 w-8 h-8 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors animate-float" style={{ animationDelay: '0.6s' }} />
                    <div className="relative z-10">
                      <div className="flex flex-col items-center gap-0.5 mb-0.5">
                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary/60 animate-float" style={{ animationDelay: '0.3s' }} />
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary animate-fade-in">$50K+</div>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">Rewards</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Animated Visual Elements */}
              <div className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] flex items-center justify-center animate-fade-in-delay-3">
                {/* Animated background orbs - contained to right side */}
                <div className="absolute top-5 right-5 w-32 h-32 sm:w-40 sm:h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-glow-large animate-float" />
                <div className="absolute bottom-5 left-5 w-40 h-40 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-3xl animate-pulse-glow-large animate-float-reverse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-1/4 w-36 h-36 sm:w-44 sm:h-44 bg-primary/8 rounded-full blur-3xl opacity-30 animate-pulse-glow-large animate-drift" style={{ animationDelay: '0.5s' }} />
                
                {/* Floating geometric shapes */}
                <div className="absolute top-10 right-1/4 w-12 h-12 sm:w-16 sm:h-16 opacity-20">
                  <div className="w-full h-full bg-primary/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: '0.3s' }} />
                </div>
                <div className="absolute bottom-20 left-1/4 w-10 h-10 sm:w-14 sm:h-14 opacity-15">
                  <div className="w-full h-full bg-primary/30 rounded-full animate-float-reverse" style={{ animationDelay: '0.7s' }} />
                </div>
                <div className="absolute top-1/2 right-10 w-8 h-8 sm:w-12 sm:h-12 opacity-25 hidden md:block">
                  <div className="w-full h-full bg-primary/25 rounded-lg rotate-12 animate-drift" style={{ animationDelay: '1.2s' }} />
                </div>

                {/* Central animated element */}
                <div className="relative w-full max-w-xs h-full max-h-[350px] flex items-center justify-center">
                  {/* Central glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full blur-3xl animate-pulse-glow-large" />
                  
                  {/* Rotating rings */}
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin-slow" style={{ animationDuration: '20s' }} />
                  <div className="absolute inset-4 border border-primary/15 rounded-full animate-spin-slow" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                  
                  {/* Floating icons around center */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-primary/10 p-2 sm:p-2.5 rounded-full backdrop-blur-sm border border-primary/20 animate-float">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="bg-primary/10 p-2 sm:p-2.5 rounded-full backdrop-blur-sm border border-primary/20 animate-float-reverse" style={{ animationDelay: '0.5s' }}>
                      <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
                    <div className="bg-primary/10 p-2 sm:p-2.5 rounded-full backdrop-blur-sm border border-primary/20 animate-float" style={{ animationDelay: '1s' }}>
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>
                  <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 hidden sm:block">
                    <div className="bg-primary/10 p-2 sm:p-2.5 rounded-full backdrop-blur-sm border border-primary/20 animate-float-reverse" style={{ animationDelay: '1.5s' }}>
                      <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>
                  
                  {/* Additional floating icons */}
                  <div className="absolute top-1/4 right-1/4 opacity-20 hidden md:block">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-float" style={{ animationDelay: '0.8s' }} />
                  </div>
                  <div className="absolute bottom-1/4 left-1/4 opacity-15 hidden lg:block">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary animate-float-reverse" style={{ animationDelay: '1.1s' }} />
                  </div>
                  
                  {/* Center element */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-br from-primary to-primary/60 p-3 sm:p-4 rounded-xl shadow-elevation-2 animate-float">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              
                  {/* Orbiting elements around center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-4 sm:h-4 opacity-30 hidden lg:block">
                    <div className="absolute inset-0 bg-primary rounded-full animate-orbit" style={{ animationDelay: '0s' }} />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-4 sm:h-4 opacity-20 hidden lg:block">
                    <div className="absolute inset-0 bg-primary/50 rounded-full animate-orbit-reverse" style={{ animationDelay: '2s' }} />
                  </div>
                </div>

                {/* Moving gradient lines */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer-move" />
                  <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-shimmer-move" style={{ animationDelay: '1.5s' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 md:py-32 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollAnimation direction="up" delay={0.1}>
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <Badge variant="secondary" className="mb-4 gap-2 px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Target className="h-3.5 w-3.5" />
                <span className="text-primary font-medium">Features</span>
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Why Choose Scholaric?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4">
                Experience the next generation of educational platforms with blockchain-powered incentives and transparent learning rewards
              </p>
            </div>
            </ScrollAnimation>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <ScrollAnimation direction="up" delay={0.1}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:border-primary/50 hover:shadow-elevation-1 transition-all group card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">Educational Content</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Create and participate in quizzes covering various subjects. From science to history, find content that matters.
                  </p>
                </CardContent>
              </Card>
              </ScrollAnimation>

              {/* Feature 2 */}
              <ScrollAnimation direction="up" delay={0.2}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:border-primary/50 hover:shadow-elevation-1 transition-all group card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    <Coins className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">cUSD Rewards</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Earn stable Celo Dollars for correct answers. Real cryptocurrency rewards for real knowledge.
                  </p>
                </CardContent>
              </Card>
              </ScrollAnimation>

              {/* Feature 3 */}
              <ScrollAnimation direction="up" delay={0.3}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:border-primary/50 hover:shadow-elevation-1 transition-all group card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">Secure & Transparent</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Built on Celo blockchain with commit-reveal patterns for fair and transparent quiz participation.
                  </p>
                </CardContent>
              </Card>
              </ScrollAnimation>

              {/* Feature 4 */}
              <ScrollAnimation direction="up" delay={0.4}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:border-primary/50 hover:shadow-elevation-1 transition-all group card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">Community Driven</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Fund prize pools collectively and support educational initiatives that matter to your community.
                  </p>
                </CardContent>
              </Card>
              </ScrollAnimation>

              {/* Feature 5 */}
              <ScrollAnimation direction="up" delay={0.5}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:border-primary/50 hover:shadow-elevation-1 transition-all group card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">Gas-Free Experience</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    MiniPay integration provides seamless, gas-free transactions for frictionless learning.
                  </p>
                </CardContent>
              </Card>
              </ScrollAnimation>

              {/* Feature 6 */}
              <ScrollAnimation direction="up" delay={0.6}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:border-primary/50 hover:shadow-elevation-1 transition-all group card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">Gamified Learning</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Earn badges, climb leaderboards, and compete with peers in an engaging environment.
                  </p>
                </CardContent>
              </Card>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollAnimation direction="up" delay={0.1}>
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <Badge variant="secondary" className="mb-4 gap-2 px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="text-primary font-medium">How It Works</span>
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4">
                Start learning and earning in minutes with our intuitive platform
              </p>
            </div>
            </ScrollAnimation>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto relative">
              {/* Connection Lines - Desktop Only */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              {/* Step 1 */}
              <ScrollAnimation direction="up" delay={0.2}>
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative z-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-elevation-2 border-4 border-background transition-all hover:scale-110">
                    1
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold">Connect Wallet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                    Connect your MetaMask, WalletConnect, or MiniPay wallet to get started on Scholaric instantly.
                  </p>
                </div>
              </div>
              </ScrollAnimation>
              
              {/* Step 2 */}
              <ScrollAnimation direction="up" delay={0.3}>
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative z-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-elevation-2 border-4 border-background transition-all hover:scale-110">
                    2
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold">Join or Create</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                    Browse available quizzes and join one, or create your own with custom questions and prizes.
                  </p>
                </div>
              </div>
              </ScrollAnimation>
              
              {/* Step 3 */}
              <ScrollAnimation direction="up" delay={0.4}>
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative z-10 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-elevation-2 border-4 border-background transition-all hover:scale-110">
                    3
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold">Learn & Earn</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
                    Take quizzes, answer correctly, and claim your cUSD rewards directly to your wallet.
                  </p>
                </div>
              </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-20 md:py-32 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollAnimation direction="up" delay={0.1}>
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <Badge variant="secondary" className="mb-4 gap-2 px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Star className="h-3.5 w-3.5" />
                <span className="text-primary font-medium">Testimonials</span>
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                What Learners Say
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4">
                Join thousands of satisfied learners earning while they learn
              </p>
            </div>
            </ScrollAnimation>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {/* Testimonial 1 */}
              <ScrollAnimation direction="up" delay={0.2}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:shadow-elevation-1 transition-all card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic">
                    "Scholaric has revolutionized how I learn. Earning cUSD while studying is absolutely incredible!"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary text-base sm:text-lg">
                      SA
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Sarah Anderson</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Computer Science Student</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </ScrollAnimation>

              {/* Testimonial 2 */}
              <ScrollAnimation direction="up" delay={0.3}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:shadow-elevation-1 transition-all card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic">
                    "Creating quizzes for my students and rewarding them has never been easier. Love this platform!"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary text-base sm:text-lg">
                      MR
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Michael Rodriguez</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">High School Teacher</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </ScrollAnimation>

              {/* Testimonial 3 */}
              <ScrollAnimation direction="up" delay={0.4}>
              <Card className="border-border bg-gradient-to-br from-background to-muted/50 hover:shadow-elevation-1 transition-all card-hover">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic">
                    "The blockchain transparency gives me confidence. I know the rewards are fair and secure always."
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary text-base sm:text-lg">
                      EP
                    </div>
                    <div>
                      <div className="font-semibold text-sm sm:text-base">Emily Parker</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Blockchain Enthusiast</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
          <div className="absolute top-20 right-20 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <ScrollAnimation direction="up" delay={0.1} duration={0.8}>
              <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold px-4">
                Ready to Start Learning?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-4">
                Join Scholaric today and be part of the decentralized education revolution where your knowledge is worth real money
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {isConnected ? (
                  <>
                    <Button size="lg" className="gap-2 shadow-glow hover:shadow-elevation-2 transition-all px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base btn-press w-full sm:w-auto" asChild>
                      <Link href="/catalogue">
                        <Rocket className="h-4 w-4 sm:h-5 sm:w-5" />
                        Browse Quizzes
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base border-primary/20 hover:border-primary/50 hover:bg-primary/5 btn-press w-full sm:w-auto" asChild>
                      <Link href="/create">
                        <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                        Create Your First Quiz
                      </Link>
          </Button>
                  </>
                ) : (
                  <div className="text-center w-full">
                    <p className="text-sm text-muted-foreground mb-4">Connect your wallet to get started</p>
                    <ConnectButton redirectToDashboard={true} />
                  </div>
                )}
        </div>
      </div>
            </ScrollAnimation>
    </div>
  </section>
</main>

      <Footer />
    </div>
  )
}
