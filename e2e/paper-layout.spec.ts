import { expect, test, type Locator } from '@playwright/test'

async function expectPaperContentFits(paper: Locator) {
  const measurements = await paper.evaluate(element => {
    const sheet = element.getBoundingClientRect()
    const padding = parseFloat(getComputedStyle(element).paddingBottom)
    const title = element.querySelector('h1')!.getBoundingClientRect()
    const meta = element.querySelector('.worksheet-meta')?.getBoundingClientRect()
    const instructions = element.querySelector('.worksheet-instructions')?.getBoundingClientRect()
    const rows = element.querySelectorAll('.chinese-practice-row, .math-problem')
    return {
      titleBottom: title.bottom,
      metaTop: meta?.top,
      metaBottom: meta?.bottom,
      instructionsBottom: instructions?.bottom,
      firstRowTop: rows[0].getBoundingClientRect().top,
      lastRowBottom: rows[rows.length - 1].getBoundingClientRect().bottom,
      contentBottom: sheet.bottom - padding,
      horizontalOverflow: element.querySelector('h1')!.scrollWidth > element.querySelector('h1')!.clientWidth,
    }
  })
  expect(measurements.horizontalOverflow).toBe(false)
  expect(measurements.titleBottom).toBeLessThanOrEqual(measurements.metaTop ?? measurements.firstRowTop)
  expect(measurements.metaBottom ?? measurements.titleBottom).toBeLessThanOrEqual(measurements.firstRowTop)
  expect(measurements.instructionsBottom ?? measurements.titleBottom).toBeLessThanOrEqual(measurements.firstRowTop)
  expect(measurements.lastRowBottom).toBeLessThanOrEqual(measurements.contentBottom + 0.5)
  return measurements
}

test('long titles and answer titles stay clear of student information and all printed rows', async ({ page }) => {
  await page.goto('/')
  const title = '认'.repeat(40)
  await page.locator('.sidebar-controls input[maxlength="40"]').fill(title)
  await page.getByText('20mm', { exact: true }).click()
  await page.emulateMedia({ media: 'print' })
  for (const paper of await page.locator('.worksheet-sheet').all()) {
    await expect(paper.locator('h1')).toHaveText(title)
    await expectPaperContentFits(paper)
  }
  await page.emulateMedia({ media: 'screen' })
  await page.getByRole('radio', { name: '数学', exact: true }).check()
  await page.getByText('避免重复题目', { exact: true }).click()
  await page.getByRole('spinbutton', { name: '题目数量' }).fill('200')
  await page.locator('.sidebar-controls input[maxlength="40"]').fill(title)
  await page.getByText('20mm', { exact: true }).click()
  await page.getByText('附答案页', { exact: true }).click()
  await page.emulateMedia({ media: 'print' })
  const papers = page.locator('.worksheet-sheet')
  await expect(papers).toHaveCount(6)
  const counts: number[] = []
  for (const paper of await papers.all()) {
    await expectPaperContentFits(paper)
    counts.push(await paper.locator('.math-problem').count())
  }
  expect(counts).toEqual([84, 84, 32, 80, 80, 40])
  await expect(papers.last().locator('h1')).toHaveText(`${title} · 参考答案`)
})

test('hidden student information frees a twelfth row and whitespace instructions consume no space', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox', { name: '练习内容' }).fill('天地人你我他春风花草树山')
  await page.getByText('20mm', { exact: true }).click()
  await page.getByText('姓名 / 班级 / 日期 / 得分', { exact: true }).click()
  await page.locator('.sidebar-controls input[maxlength="80"]').fill('   ')
  await expect(page.locator('.worksheet-sheet')).toHaveCount(1)
  await expect(page.locator('.chinese-practice-row')).toHaveCount(12)
  await expect(page.locator('.worksheet-instructions')).toHaveCount(0)
  await page.emulateMedia({ media: 'print' })
  await expectPaperContentFits(page.locator('.worksheet-sheet'))
})

test('maximum-length instructions fit above seven large practice rows per page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('6', { exact: true }).click()
  await page.getByText('20mm', { exact: true }).click()
  const instructions = '认真'.repeat(40)
  await page.locator('.sidebar-controls input[maxlength="80"]').fill(instructions)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.worksheet-sheet')).toHaveCount(2)
  for (const paper of await page.locator('.worksheet-sheet').all()) {
    await expect(paper.locator('.chinese-practice-row')).toHaveCount(7)
    await expect(paper.locator('.worksheet-instructions')).toHaveText(instructions)
    await expectPaperContentFits(paper)
  }
})
