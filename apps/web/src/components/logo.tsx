'use client'

import React from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Animated background circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="1">
                <animate attributeName="stop-opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="1">
                <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Main book shape */}
          <g transform="translate(32, 32)">
            {/* Book cover - animated */}
            <g>
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1;1.02;1"
                dur="4s"
                repeatCount="indefinite"
              />
              <path
                d="M -18 -12 L 18 -12 L 18 12 L -18 12 Z"
                fill="url(#logoGradient)"
                filter="url(#glow)"
                opacity="0.95"
              />
            </g>

            {/* Book pages */}
            <path
              d="M -16 -10 L 16 -10 L 16 10 L -16 10 Z"
              fill="#FFFFFF"
              opacity="0.9"
            />

            {/* Book binding */}
            <rect
              x="-18"
              y="-12"
              width="4"
              height="24"
              fill="#4338CA"
              opacity="0.8"
            />

            {/* Text lines on pages - animated */}
            <g opacity="0.6">
              <line
                x1="-12"
                y1="-6"
                x2="12"
                y2="-6"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <animate
                  attributeName="x2"
                  values="12;-8;12"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </line>
              <line
                x1="-12"
                y1="0"
                x2="12"
                y2="0"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <animate
                  attributeName="x2"
                  values="12;0;12"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </line>
              <line
                x1="-12"
                y1="6"
                x2="12"
                y2="6"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <animate
                  attributeName="x2"
                  values="12;-4;12"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </line>
            </g>

            {/* Sparkle stars around the book */}
            <g>
              {/* Top sparkle */}
              <g transform="translate(0, -20)">
                <path
                  d="M 0 -4 L 1.5 0 L 0 4 L -1.5 0 Z M -4 0 L 0 -1.5 L 4 0 L 0 1.5 Z"
                  fill="#FCD34D"
                  opacity="0.9"
                >
                  <animate
                    attributeName="opacity"
                    values="0.3;1;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;360"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Right sparkle */}
              <g transform="translate(20, 0)">
                <path
                  d="M 0 -3 L 1 0 L 0 3 L -1 0 Z M -3 0 L 0 -1 L 3 0 L 0 1 Z"
                  fill="#FCD34D"
                  opacity="0.7"
                >
                  <animate
                    attributeName="opacity"
                    values="0.2;0.9;0.2"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="360;0"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Bottom sparkle */}
              <g transform="translate(0, 20)">
                <path
                  d="M 0 -3 L 1 0 L 0 3 L -1 0 Z M -3 0 L 0 -1 L 3 0 L 0 1 Z"
                  fill="#FCD34D"
                  opacity="0.6"
                >
                  <animate
                    attributeName="opacity"
                    values="0.3;0.8;0.3"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;360"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            </g>

            {/* Light rays effect */}
            <g opacity="0.3">
              <path
                d="M 0 -24 L 2 -18 L -2 -18 Z"
                fill="#6366F1"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.4;0.1"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M 24 0 L 18 2 L 18 -2 Z"
                fill="#6366F1"
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.4;0.1"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </div>
      
      {showText && (
        <span 
          className={`${textSizes[size]} font-bold bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#4F46E5] bg-clip-text text-transparent animate-gradient`}
          style={{
            backgroundSize: '200% 200%'
          }}
        >
          Scholaric
        </span>
      )}
    </div>
  )
}

