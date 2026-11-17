/** @type {import('tailwindcss').Config} */
// Colours are CSS custom properties (src/index.css), most of them the family kit's, so dark mode swaps them in
// one place.
const token = name => `var(--${name})`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // hover: styles only where there is a real pointer, so a tap on a phone doesn't leave them stuck on
  future: { hoverOnlyWhenSupported: true },
  theme: {
    borderRadius: { none: '0', DEFAULT: '3px', full: '9999px' },
    boxShadow: { none: 'none' },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      page: token('page'),
      panel: token('panel'),
      ink: token('ink'),
      muted: token('ink-muted'),
      rule: token('rule'),
      faint: token('rule-faint'),
      heather: token('heather'),
      'heather-strong': token('heather-strong'),
      'heather-tint': token('heather-tint'),
      'on-heather': token('on-heather'),
      band: token('band'),
      'on-band': token('on-band'),
      'compare-a': token('compare-a'),
      'compare-b': token('compare-b'),
    },
    fontFamily: {
      serif: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
      sans: ['"Source Sans 3"', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
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
      maxWidth: { prose: '52rem', page: '84rem' },
    },
  },
  plugins: [],
};
