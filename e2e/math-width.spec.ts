import { expect, test } from '@playwright/test'

test('five-column multiplication answers fit their cells at the widest supported margins', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.999999 })
  await page.goto('/')
  await page.getByRole('radio', { name: '数学', exact: true }).check()
  await page.getByText('乘法 ×', { exact: true }).click()
  await page.getByText('加法 +', { exact: true }).click()
  await page.getByText('减法 −', { exact: true }).click()
  await page.getByText('避免重复题目', { exact: true }).click()
  await page.getByRole('spinbutton', { name: '数值范围' }).fill('100')
  await page.getByRole('spinbutton', { name: '题目数量' }).fill('20')
  await page.getByText('5 列', { exact: true }).click()
  await page.getByText('20mm', { exact: true }).click()
  await page.getByText('附答案页', { exact: true }).click()
  await page.getByTitle('下一页').click()
  await expect(page.locator('.math-answer').first()).toHaveText('10000')

  for (const media of ['screen', 'print'] as const) {
    await page.emulateMedia({ media })
    await expect(page.locator('.worksheet-sheet')).toHaveCount(media === 'print' ? 2 : 1)
    const answerGrid = page.locator('.worksheet-sheet').filter({ has: page.locator('.math-answer') }).locator('.math-problems')
    const measurements = await answerGrid.evaluate(grid => ({
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      cells: Array.from(grid.children, cell => {
        const bounds = cell.getBoundingClientRect()
        return {
          left: bounds.left,
          right: bounds.right,
          fontSize: parseFloat(getComputedStyle(cell).fontSize),
          spans: Array.from(cell.children, span => {
            const range = document.createRange()
            range.selectNodeContents(span)
            const text = range.getBoundingClientRect()
            return { left: text.left, right: text.right }
          }),
        }
      }),
    }))
    expect(measurements.columns).toBe(5)
    expect(measurements.cells).toHaveLength(20)
    for (const cell of measurements.cells) {
      expect(cell.fontSize).toBeGreaterThanOrEqual(12)
      for (const span of cell.spans) {
        expect(span.left).toBeGreaterThanOrEqual(cell.left - 0.5)
        expect(span.right).toBeLessThanOrEqual(cell.right + 0.5)
      }
    }
  }
})
