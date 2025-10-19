import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        coverage: {
            all: false,
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/views/**/*.vue'], // yang ditest hanya file di dalem folder views aja agar tidak tercampur dengan code template bawaan (PrimeVue)
            exclude: [
                'src/main.js',
                'src/router/**',
                'src/views/pages/auth/Access.vue',
                'src/views/pages/auth/Error.vue',
                'src/views/pages/NotFound.vue',
                '**/*.spec.{js,jsx,ts,tsx}',
                '**/node_modules/**',
                '**/primevue/**'
            ],
            reportsDirectory: './coverage'
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src') // Pastikan alias untuk `@` diarahkan ke `src`
        }
    }
});
