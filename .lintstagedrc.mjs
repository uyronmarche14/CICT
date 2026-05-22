export default {
  'cict-backend/src/**/*.ts': [
    'eslint --fix --c cict-backend/eslint.config.mjs',
    () => 'tsc --noEmit -p cict-backend/tsconfig.json',
  ],
  'cictv4/src/**/*.{ts,tsx}': [
    'eslint --fix --c cictv4/eslint.config.mjs',
    () => 'tsc --noEmit -p cictv4/tsconfig.json',
  ],
};
