import type { ChineseCell, ChineseConfig } from './types'
import { getWorksheetLayout } from '../../lib/worksheet-layout'

export function createChineseRows(config: ChineseConfig): ChineseCell[][] {
  if (!Number.isInteger(config.columns) || config.columns < 1) {
    throw new RangeError('每行格数必须为正整数')
  }

  const characters = Array.from(config.content.replace(/\s/g, ''))
  return characters.flatMap(character =>
    Array.from({ length: config.repeatRows }, () =>
      Array.from({ length: config.columns }, (_, index): ChineseCell => {
        if (config.mode === 'blank') return { character: '', guide: false }
        if (config.mode === 'trace') return { character, guide: true }
        if (index === 0) return { character, guide: false }
        if (config.mode === 'mixed' && index === 1) return { character, guide: true }
        return { character: '', guide: false }
      }),
    ),
  )
}

export function createChinesePages(config: ChineseConfig): ChineseCell[][][] {
  const rows = createChineseRows(config)
  const cellSize = (210 - config.margin * 2) / config.columns
  const availableHeight = getWorksheetLayout(config).contentHeight
  const rowsPerPage = Math.floor((availableHeight + 3) / (cellSize + 3))

  if (rows.length === 0) {
    return [Array.from({ length: rowsPerPage }, () =>
      Array.from({ length: config.columns }, () => ({ character: '', guide: false })),
    )]
  }

  const pages: ChineseCell[][][] = []
  for (let start = 0; start < rows.length; start += rowsPerPage) {
    pages.push(rows.slice(start, start + rowsPerPage))
  }
  return pages
}
