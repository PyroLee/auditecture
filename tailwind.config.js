/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f1ead8',
        paperDeep: '#e8dcc0',
        ink: '#2a2620',
        inkSoft: '#5b5347',
        inkMute: 'rgba(42,38,32,0.42)',
        inkFaint: 'rgba(42,38,32,0.20)',
        accent: '#1a2332',
        rule: 'rgba(60,50,35,0.09)',
        ruleStrong: 'rgba(60,50,35,0.22)',
        sectionGrey: '#968d7e',
        sectionGreyInk: '#4a4338',
        sectionBlue: '#5e7d92',
        sectionBlueInk: '#2f4754',
        sectionOchre: '#c19139',
        sectionOchreInk: '#6e4d10',
        sectionWine: '#99454f',
        sectionWineInk: '#5a232a',
        saveOk: '#6c8a59',
      },
      fontFamily: {
        hand: ['"Caveat"', 'cursive'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
