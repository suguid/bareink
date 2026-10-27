import { mkdirSync, writeFileSync } from 'node:fs'
import { nvdaTest as test } from '@guidepup/playwright'
import { expect } from '@playwright/test'

const page = new URL('page.html', import.meta.url).href
const charts = [
  'Revenue grew 26% in the first half',
  'Cash fell for five months, then recovered',
  'Two months closed at a loss',
  'Engineering spends the most',
  'Of every $100 in, $15 is profit',
  'Subscriptions bring most of the revenue',
]
const tables = ['Five invoices are overdue', 'Revenue and headcount grew together', 'Spending by team, Marketing not reported']

test.use({ nvdaStartOptions: { capture: 'initial' } })

test('NVDA reads every chart, its bars and its tables', async ({ page: tab, nvda }) => {
  const heard: Record<string, string[]> = {}
  const listen = async (step: string, act: () => Promise<void>) => {
    await nvda.clearSpokenPhraseLog()
    await act()
    heard[step] = await nvda.spokenPhraseLog()
  }

  await tab.goto(page, { waitUntil: 'load' })
  await tab.locator('main').waitFor()
  await nvda.navigateToWebContent()

  for (let i = 0; i < 30; i++) await listen(`graphic ${i + 1}`, () => nvda.perform(nvda.keyboardCommands.moveToNextGraphic))

  await tab.goto(page, { waitUntil: 'load' })
  await nvda.navigateToWebContent()
  for (let i = 0; i < 8; i++) await listen(`tab ${i + 1}`, () => nvda.press('Tab'))

  await tab.goto(page, { waitUntil: 'load' })
  await nvda.navigateToWebContent()
  for (let i = 0; i < 12; i++) await listen(`table ${i + 1}`, () => nvda.perform(nvda.keyboardCommands.moveToNextTable))

  mkdirSync('test-results', { recursive: true })
  writeFileSync('test-results/nvda-heard.json', JSON.stringify(heard, null, 2))
  console.log(JSON.stringify(heard, null, 2))

  const all = (prefix: string) => Object.entries(heard).filter(([k]) => k.startsWith(prefix)).flatMap(([, v]) => v).join('\n')
  for (const title of charts) expect(all('graphic'), `graphic "${title}"`).toContain(title)
  expect(all('tab'), 'Tab reaches a bar and reads its value').toMatch(/Jan.*41,?200|Jan.*\$41\.2K/)
  for (const title of tables) expect(all('table'), `table "${title}"`).toContain(title)
})
