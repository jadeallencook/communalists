import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Turns off ESLint rules that conflict with Prettier; Prettier owns formatting.
    prettier,
    globalIgnores([
        '.next/**',
        'out/**',
        'build/**',
        'coverage/**',
        'storybook-static/**',
        '.storybook/docs/generated/**',
        'next-env.d.ts',
    ]),
]);

export default eslintConfig;
