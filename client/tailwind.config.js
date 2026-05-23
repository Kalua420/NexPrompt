export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg, #080a0f)',
        paper: 'var(--color-paper, #0e1218)',
        primary: 'var(--color-primary, #4f6ef7)',
        accent: 'var(--color-accent, #7b94ff)',
        border: 'var(--color-border, #1e2438)',
        text: 'var(--color-text, #e8eaf2)',
        'text-muted': 'var(--color-text-muted, #8892a0)',
      },
      fontFamily: {
        heading: 'var(--font-heading, "Inter", sans-serif)',
      },
    },
  },
  plugins: [],
};
