/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#334E68',
          600: '#243B53',
          700: '#1A2B42',
          800: '#102A43',
          900: '#0A1628',
        },
        accent: {
          DEFAULT: '#1B69D4',
          light: '#4A8DE8',
          dark: '#1456B0',
        },
        success: '#1A8754',
        warning: '#D4A017',
        // Warm variant (from brand/tokens — used on /apply, portal, deck cover).
        // Keep these separate from navy/accent so existing pages stay strict.
        gold: '#B08A3E',
        'gold-soft': '#F7F4EA',
        'gold-line': '#EFD99A',
        'warm-bg': '#F5F3EE',
        'warm-ink': '#1C2B3A',
        ok: '#1E8449',
        err: '#C0392B',
      },
      letterSpacing: {
        caps: '0.06em',
        wide1: '0.08em',
        wide2: '0.14em',
        wide3: '0.22em',
      },
      borderRadius: {
        soft: '3px',
        flat: '2px',
      },
      boxShadow: {
        whisper: '0 1px 2px rgba(31, 78, 120, 0.08), 0 2px 6px rgba(31, 78, 120, 0.06)',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['2.75rem', { lineHeight: '1.15', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
};
