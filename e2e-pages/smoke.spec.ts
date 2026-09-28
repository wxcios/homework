import { expect, test, type Page } from '@playwright/test'

async function expectPrintedPages(page: Page) {
  await expect(page.locator('.preview-page')).toHaveCount(1)
  await page.emulateMedia({ media: 'print' })
  await expect.poll(() => page.locator('.worksheet-sheet').count()).toBeGreaterThan(1)
  await expect(page.locator('.workspace-sidebar')).toBeHidden()
  for (const paper of await page.locator('.worksheet-sheet').all()) {
    await expect(paper).toBeVisible()
    const dimensions = await paper.evaluate(element => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }))
    expect(dimensions.width).toBeCloseTo(210 * 96 / 25.4, 0)
    expect(dimensions.height).toBeCloseTo(297 * 96 / 25.4, 0)
  }
}

test('Pages assets load under /homework/ and both subjects retain configured content and print every page', async ({ page }) => {
  const failures: string[] = []
  page.on('requestfailed', request => failures.push(`${request.url()}: ${request.failure()?.errorText}`))
  page.on('response', response => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`)
  })
  page.on('pageerror', error => failures.push(error.message))

  await page.goto('./')
  expect(failures).toEqual([])
  await expect(page.getByRole('complementary', { name: '语文配置' })).toBeVisible()
  const content = '天地人你我他春风花草树山水田日月水火山石田土学习快乐朋友'
  await page.getByRole('textbox', { name: '练习内容' }).fill(content)
  await page.getByText('2 行', { exact: true }).click()
  await expectPrintedPages(page)
  await expect(page.locator('.chinese-practice-row')).toHaveCount(56)
  await page.emulateMedia({ media: 'screen' })
  await expect(page.locator('.preview-page')).toHaveCount(1)

  await page.getByRole('radio', { name: '数学', exact: true }).check()
  await expect(page.getByRole('complementary', { name: '数学配置' })).toBeVisible()
  await page.getByRole('spinbutton', { name: '题目数量' }).fill('20')
  await page.getByRole('checkbox', { name: '附答案页', exact: true }).check()
  await expect(page.locator('.math-problem')).toHaveCount(20)
  const questions = await page.locator('.math-problem').allTextContents()

  await page.getByRole('radio', { name: '语文', exact: true }).check()
  await expect(page.getByRole('textbox', { name: '练习内容' })).toHaveValue(content)
  await expect(page.getByRole('radio', { name: '2 行', exact: true })).toBeChecked()
  await page.getByRole('radio', { name: '数学', exact: true }).check()
  await expect(page.getByRole('spinbutton', { name: '题目数量' })).toHaveValue('20')
  await expect(page.getByRole('checkbox', { name: '附答案页', exact: true })).toBeChecked()
  expect(await page.locator('.math-problem').allTextContents()).toEqual(questions)

  await expectPrintedPages(page)
  await expect(page.locator('.worksheet-sheet')).toHaveCount(2)
  await expect(page.locator('.math-problem')).toHaveCount(40)
  await expect(page.locator('.math-answer')).toHaveCount(20)
  await page.emulateMedia({ media: 'screen' })
  await expect(page.locator('.preview-page')).toHaveCount(1)
  expect(await page.locator('.math-problem').allTextContents()).toEqual(questions)
  expect(failures).toEqual([])
})
