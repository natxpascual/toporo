/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Design System Palette ───
      colors: {
        // Primary Brand Palette
        brand: {
          50:  '#E9F2FF',
          100: '#CCE0FF',
          200: '#85B8FF',
          300: '#579DFF',
          400: '#2684FF',
          500: '#0C66E4',   // Primary Blue
          600: '#0052CC',   // Deep Blue
          700: '#0747A6',   // Active Blue
          800: '#09326C',
          900: '#052147',
          950: '#021226',
        },
        // Alias primary brand for backwards compatibility
        violet: {
          50:  '#E9F2FF',
          100: '#CCE0FF',
          200: '#85B8FF',
          300: '#579DFF',
          400: '#2684FF',
          500: '#0C66E4',
          600: '#0052CC',
          700: '#0747A6',
          800: '#09326C',
          900: '#052147',
          950: '#021226',
        },
        // Surfaces & Neutrals
        neutral: {
          nav:        '#161A1D',
          bg:         '#1D2125',
          surface:    '#22272B',
          surface2:   '#282E33',
          surface3:   '#2C333A',
          border:     '#333C43',
          borderSubtle:'#282E33',
          borderBold: '#454F59',
          hover:      '#2C333A',
          text:       '#DEE4EA',
          textSubtle: '#9FADBC',
          textMuted:  '#738496',
        },
        // App surfaces mapped to CSS variables
        app: {
          bg:       'var(--color-bg)',
          surface:  'var(--color-surface)',
          surface2: 'var(--color-surface-2)',
          surface3: 'var(--color-surface-3)',
          border:   'var(--color-border)',
          hover:    'var(--color-border-hover)',
          active:   'var(--color-surface-3)',
        },
        // Status Lozenges
        lozenge: {
          todo: {
            bg:   '#DFE1E6',
            text: '#42526E',
            darkBg: '#2C333A',
            darkText: '#8C9BAB',
          },
          inprogress: {
            bg:   '#E9F2FF',
            text: '#0052CC',
            darkBg: '#0C294D',
            darkText: '#579DFF',
          },
          success: {
            bg:   '#DCFFF1',
            text: '#1F845A',
            darkBg: '#143B2B',
            darkText: '#4BCE97',
          },
          warning: {
            bg:   '#FFF7D6',
            text: '#9E6C00',
            darkBg: '#332E1B',
            darkText: '#F5CD47',
          },
          danger: {
            bg:   '#FFEDEB',
            text: '#CA3521',
            darkBg: '#441C17',
            darkText: '#FD9891',
          },
        },
        // Azure service category colors (retained for Azure resource recognition)
        azure: {
          blue:        '#0078d4',
          compute:     '#E2B203',
          network:     '#0C66E4',
          storage:     '#1F845A',
          database:    '#8270DB',
          security:    '#E54937',
          ai:          '#E34935',
          integration: '#00A3BF',
          container:   '#0052CC',
        },
        canvas: {
          bg:     'var(--color-bg)',
          panel:  'var(--color-surface)',
          card:   'var(--color-surface)',
          border: 'var(--color-border)',
          hover:  'var(--color-surface-2)',
        },
      },

      // ─── Typography ───
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          "'Noto Sans'",
          'Ubuntu',
          "'Fira Sans'",
          "'Helvetica Neue'",
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          "'Segoe UI'",
          'Roboto',
          'sans-serif',
        ],
        mono: [
          "'SFMono-Medium'",
          "'SF Mono'",
          "'Segoe UI Mono'",
          "'Roboto Mono'",
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },

      // ─── Standard Border Radius ───
      borderRadius: {
        'xs':  '2px',
        'sm':  '3px',      // Standard button / input / lozenge radius
        DEFAULT: '4px',    // Standard card / panel radius
        'md':  '4px',
        'lg':  '6px',
        'xl':  '8px',
        '2xl': '12px',
      },

      // ─── Elevation Shadows ───
      boxShadow: {
        'e100': '0 1px 1px rgba(9, 30, 66, 0.25), 0 0 1px 1px rgba(9, 30, 66, 0.13)',
        'e200': '0 3px 5px -1px rgba(9, 30, 66, 0.2), 0 0 1px 1px rgba(9, 30, 66, 0.12)',
        'e300': '0 4px 8px -2px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        'e400': '0 8px 16px -4px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        'e500': '0 12px 24px -6px rgba(9, 30, 66, 0.25), 0 0 1px rgba(9, 30, 66, 0.31)',
        'focus': '0 0 0 2px #4C9AFF',
        'panel': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'node':  '0 1px 3px rgba(0, 0, 0, 0.15)',
        'node-hover': '0 4px 12px rgba(0, 0, 0, 0.2)',
      },

      // ─── Animations ───
      keyframes: {
        'fade-in-up': {
          from: { transform: 'translateY(6px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
      },
      animation: {
        'fade-in-up':      'fade-in-up 0.15s ease',
        'fade-in':         'fade-in 0.15s ease',
        'slide-in-right':  'slide-in-right 0.2s ease',
      },

      // ─── Transitions ───
      transitionDuration: {
        DEFAULT: '120ms',
        'fast': '80ms',
        'base': '150ms',
        'slow': '250ms',
      },
    },
  },
  plugins: [],
}
