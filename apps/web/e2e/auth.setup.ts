import { test as base } from '@playwright/test';

export const test = base.extend({
  // Shared fixtures go here
});

export { expect } from '@playwright/test';
