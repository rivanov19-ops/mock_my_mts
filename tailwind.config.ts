import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mts: {
          red:        '#E30611',
          'red-dark': '#B3000C',
          surface:    '#F5F5F5',
          muted:      '#9E9E9E',
          success:    '#4CAF50',
          warning:    '#FF9800',
        },
      },
      borderRadius: {
        card: '16px',
        btn:  '12px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,.08)',
      },
      maxWidth: {
        app: '390px',
      },
      fontFamily: {
        sans:    ['"MTS Wide"',    '"Helvetica Neue"', 'Arial', 'sans-serif'],
        compact: ['"MTS Compact"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
