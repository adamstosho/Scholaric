'use client'

import { useInView } from 'react-intersection-observer'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'
  duration?: number
  threshold?: number
}

export function ScrollAnimation({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  threshold = 0.1,
}: ScrollAnimationProps) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  })

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return inView ? 'translateY(0)' : 'translateY(30px)'
      case 'down':
        return inView ? 'translateY(0)' : 'translateY(-30px)'
      case 'left':
        return inView ? 'translateX(0)' : 'translateX(-30px)'
      case 'right':
        return inView ? 'translateX(0)' : 'translateX(30px)'
      case 'scale':
        return inView ? 'scale(1)' : 'scale(0.95)'
      case 'fade':
        return 'none'
      default:
        return 'translateY(0)'
    }
  }

  return (
    <div
      ref={ref}
      className={cn('transition-all ease-out', className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

