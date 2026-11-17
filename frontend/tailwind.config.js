/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Specified ScamQuest Brand Palette
        obsidian: {
          DEFAULT: '#171B18',
          surface: '#1F2420',
          elevated: '#282F2A',
          border: '#333C36',
        },
        parchment: {
          DEFAULT: '#F3F0E8',
          surface: '#FFFFFF',
          warm: '#ECE8DD',
          muted: '#E2DDCF',
          border: '#DCD6C7',
        },
        moss: {
          DEFAULT: '#A6C66A',
          dark: '#688537',
          light: '#F2F7EB',
          border: '#D0E3AF',
        },
        coral: {
          DEFAULT: '#D96B59',
          dark: '#A64130',
          light: '#FBF0EE',
          border: '#EEC1B9',
        },
        amber: {
          DEFAULT: '#D7B66D',
          dark: '#9E7E36',
          light: '#FAF6EC',
          border: '#EEDDB4',
        },
        mineral: {
          DEFAULT: '#777A73',
          dark: '#4D504A',
          light: '#A3A69F',
          border: '#C7C9C4',
        },
        // Backward-compatible semantic tokens
        paper: {
          DEFAULT: '#F3F0E8',
          surface: '#FFFFFF',
          warm: '#ECE8DD',
          muted: '#E2DDCF',
          border: '#DCD6C7',
        },
        ink: {
          DEFAULT: '#171B18',
          surface: '#1F2420',
          elevated: '#282F2A',
          soft: '#38423B',
          muted: '#777A73',
          faint: '#A3A69F',
          border: '#333C36',
        },
        sage: {
          DEFAULT: '#A6C66A',
          dark: '#688537',
          light: '#F2F7EB',
          border: '#D0E3AF',
        },
        terracotta: {
          DEFAULT: '#D96B59',
          dark: '#A64130',
          light: '#FBF0EE',
          border: '#EEC1B9',
        },
        gold: {
          DEFAULT: '#D7B66D',
          dark: '#9E7E36',
          light: '#FAF6EC',
          border: '#EEDDB4',
        },
      },
      fontFamily: {
        display: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        'paper-sm': '0 1px 2px rgba(23, 27, 24, 0.04)',
        'paper-md': '0 4px 14px rgba(23, 27, 24, 0.06), 0 1px 3px rgba(23, 27, 24, 0.03)',
        'paper-lg': '0 16px 36px rgba(23, 27, 24, 0.08), 0 2px 8px rgba(23, 27, 24, 0.04)',
        'obsidian-sm': '0 1px 3px rgba(0, 0, 0, 0.4)',
        'obsidian-md': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
