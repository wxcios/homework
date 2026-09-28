import { expect, it } from 'vitest'
import { getPreviewScale } from './preview'

it('fits an A4 portrait preview inside the available viewport without scrolling', () => {
  expect(getPreviewScale({ width: 900, height: 680 })).toBeCloseTo(680 / 1123, 3)
})

it('never enlarges a paper preview beyond its real printable size', () => {
  expect(getPreviewScale({ width: 3000, height: 3000 })).toBe(1)
})

it('keeps the entire page inside even a tiny or collapsed viewport', () => {
  expect(getPreviewScale({ width: 4, height: 5 })).toBeLessThanOrEqual(5 / (297 * 96 / 25.4))
  expect(getPreviewScale({ width: 0, height: 600 })).toBe(0)
  expect(getPreviewScale({ width: 400, height: -20 })).toBe(0)
})
