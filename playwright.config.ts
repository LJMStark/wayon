import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
  projects: [
    { name: 'Desktop Chrome', use: devices['Desktop Chrome'] },
    { name: 'Desktop Firefox', use: devices['Desktop Firefox'] },
    { name: 'Desktop Safari', use: devices['Desktop Safari'] },
    { name: 'Mobile Chrome', use: devices['Pixel 7'] },
    { name: 'Mobile Safari', use: devices['iPhone 14'] },
  ],
});
