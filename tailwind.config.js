/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['selector', '[class*="app-dark"]'],
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    plugins: [require('tailwindcss-primeui')],
    theme: {
        extend: {
            transitionTimingFunction: {
                default: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
            },
            colors: {
                danger: '#EF4444'
            }
        },
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        }
    },
    important: true
};
