import { withGuidepup } from '@guidepup/playwright'
import { devices } from '@playwright/test'

export default withGuidepup({
  reportSlowTests: null,
  timeout: 10 * 60 * 1000,
  retries: 2,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
})
