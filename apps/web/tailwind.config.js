/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Component tokens
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // Primary (Brand Accent)
        primary: {
          DEFAULT: 'var(--primary-500)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          foreground: 'var(--primary-foreground)',
        },
        
        // Neutrals
        neutral: {
          0: 'var(--neutral-0)',
          50: 'var(--neutral-50)',
          100: 'var(--neutral-100)',
          200: 'var(--neutral-200)',
          300: 'var(--neutral-300)',
          400: 'var(--neutral-400)',
          500: 'var(--neutral-500)',
          600: 'var(--neutral-600)',
          700: 'var(--neutral-700)',
          800: 'var(--neutral-800)',
          900: 'var(--neutral-900)',
        },
        
        // Component colors
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        
        // Surface colors
        surface: {
          DEFAULT: 'var(--surface)',
          subtle: 'var(--surface-subtle)',
          elevated: 'var(--surface-elevated)',
        },
        
        // Text roles
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        
        // Semantic colors
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['var(--type-display)', { lineHeight: 'var(--lh-heading)', letterSpacing: 'var(--ls-heading)' }],
        h1: ['var(--type-h1)', { lineHeight: 'var(--lh-heading)', letterSpacing: 'var(--ls-heading)' }],
        h2: ['var(--type-h2)', { lineHeight: 'var(--lh-heading)', letterSpacing: 'var(--ls-heading)' }],
        h3: ['var(--type-h3)', { lineHeight: '1.2', letterSpacing: 'var(--ls-heading)' }],
        h4: ['var(--type-h4)', { lineHeight: '1.25', letterSpacing: 'var(--ls-heading)' }],
        h5: ['var(--type-h5)', { lineHeight: '1.3', letterSpacing: 'var(--ls-heading)' }],
        h6: ['var(--type-h6)', { lineHeight: '1.3', letterSpacing: 'var(--ls-heading)' }],
        subtitle: ['var(--type-subtitle)', { lineHeight: 'var(--lh-body)', letterSpacing: 'var(--ls-body)' }],
        body: ['var(--type-body)', { lineHeight: 'var(--lh-body)', letterSpacing: 'var(--ls-body)' }],
        'body-large': ['var(--type-body-large)', { lineHeight: 'var(--lh-body)', letterSpacing: 'var(--ls-body)' }],
        caption: ['var(--type-caption)', { lineHeight: '1.5', letterSpacing: 'var(--ls-body)' }],
      },
      lineHeight: {
        heading: 'var(--lh-heading)',
        body: 'var(--lh-body)',
      },
      letterSpacing: {
        body: 'var(--ls-body)',
        heading: 'var(--ls-heading)',
        uppercase: 'var(--ls-uppercase)',
      },
      boxShadow: {
        'elevation-1': 'var(--shadow-elevation-1)',
        'elevation-2': 'var(--shadow-elevation-2)',
        glow: 'var(--shadow-glow)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 0.9s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.18)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
