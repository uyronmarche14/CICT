export default {
  'apps/backend/src/**/*.ts': [
    'pnpm --prefix apps/backend exec eslint --fix',
    () => 'tsc --noEmit -p apps/backend/tsconfig.json',
  ],
  'apps/web/src/**/*.{ts,tsx}': [
    'pnpm --prefix apps/web exec eslint --fix',
    () => 'tsc --noEmit -p apps/web/tsconfig.json',
  ],
};
