export default {
  'src/**/*.{ts,tsx}': ['eslint --fix', () => 'tsc --noEmit'],
};
