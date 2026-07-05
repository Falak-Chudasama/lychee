import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lychee: {
          // primary — the rough crimson shell
          shell: {
            DEFAULT: '#C81D3A',
            50: '#FCEEF1',
            200: '#F6C0CB',
            500: '#C81D3A',
            600: '#A81730',
            700: '#841126',
          },
          // secondary — the glossy dark-brown seed
          seed: {
            DEFAULT: '#8B5E3C',
            700: '#543823',
          },
          // base — the pale, sweet membrane
          membrane: {
            DEFAULT: '#FDEEF0',
            50: '#FFFBFC',
            100: '#FDEEF0',
          },
          border: '#F1B8C4',
          ink: '#431825',
        },
      },
      boxShadow: {
        soft: '0 20px 45px rgba(200, 29, 58, 0.12)',
        pop: '0 12px 28px rgba(67, 24, 37, 0.18)',
      },
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.12s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
