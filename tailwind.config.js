/** @type {import('tailwindcss').Config} */
// Colours are CSS variables (src/index.css) so that dark mode swaps them in one place.
const token = name => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Square corners and no shadows: a printed page, not a card stack
    borderRadius: { none: '0', DEFAULT: '2px', full: '9999px' },
    boxShadow: { none: 'none' },
    fontFamily: {
      serif: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
      sans: ['"Source Sans 3"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
    },
    // Nothing below 13px
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.3rem' }],
      sm: ['0.9375rem', { lineHeight: '1.45rem' }],
      base: ['1.0625rem', { lineHeight: '1.65rem' }],
      lg: ['1.1875rem', { lineHeight: '1.7rem' }],
      xl: ['1.375rem', { lineHeight: '1.8rem' }],
      '2xl': ['1.75rem', { lineHeight: '2.15rem' }],
      '3xl': ['2.25rem', { lineHeight: '2.6rem' }],
    },
    extend: {
      colors: {
        paper: token('paper'),
        sheet: token('sheet'),
        ink: token('ink'),
        muted: token('ink-muted'),
        rule: token('rule'),
        faint: token('rule-faint'),
        gilt: token('gilt'),
        'gilt-text': token('gilt-text'),
        heather: token('heather'),
        'heather-strong': token('heather-strong'),
        'heather-tint': token('heather-tint'),
        'on-heather': token('on-heather'),
        'compare-a': token('compare-a'),
        'compare-b': token('compare-b'),
      },
      letterSpacing: { caps: '0.12em' },
      maxWidth: { prose: '52rem', page: '84rem' },
    },
  },
  plugins: [],
};
