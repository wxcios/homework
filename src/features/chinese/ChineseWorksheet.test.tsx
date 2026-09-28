import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { ChineseWorksheet } from './ChineseWorksheet'
import { DEFAULT_CHINESE_CONFIG } from './defaults'

afterEach(cleanup)

it.each([6, 10, 14])('keeps all four printed border strokes inside the SVG at %i columns', columns => {
  const config = { ...DEFAULT_CHINESE_CONFIG, columns, margin: 20 }
  const rows = [Array.from({ length: columns }, () => ({ character: '', guide: false }))]
  const { container } = render(<ChineseWorksheet config={config} rows={rows} />)
  const svg = container.querySelector('svg')!
  const border = svg.querySelector('rect')!
  const [, , width, height] = svg.getAttribute('viewBox')!.split(' ').map(Number)
  const x = Number(border.getAttribute('x'))
  const y = Number(border.getAttribute('y'))
  const stroke = Number(border.getAttribute('stroke-width'))

  // A stroke is centred on its path; overflow: visible is not reliable in print renderers.
  expect(x - stroke / 2).toBeGreaterThanOrEqual(0)
  expect(y - stroke / 2).toBeGreaterThanOrEqual(0)
  expect(x + Number(border.getAttribute('width')) + stroke / 2).toBeLessThanOrEqual(width + 1e-7)
  expect(y + Number(border.getAttribute('height')) + stroke / 2).toBeLessThanOrEqual(height + 1e-7)
  const printedHeightMm = parseFloat(svg.getAttribute('height')!)
  expect(stroke * printedHeightMm / height).toBeGreaterThanOrEqual(0.19)
})
