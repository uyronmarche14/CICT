import baseConfig from '@cict/eslint-config/next';

const config = [
  ...baseConfig,
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/api/axios',
              message:
                'Use a feature API or lib/api service wrapper instead of importing the shared axios client directly.',
            },
          ],
          patterns: [
            {
              group: ['@/app/**'],
              message:
                'Do not import route/page internals. Move reusable code to features, components, hooks, or lib.',
            },
          ],
        },
      ],
    },
  },
];

export default config;
