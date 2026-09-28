import { describe, expect, it } from 'vitest'
import { createChinesePages, createChineseRows } from './logic'
import { DEFAULT_CHINESE_CONFIG } from './defaults'

describe('Chinese practice generation', () => {
  it('preserves every character in order and repeats each character as requested', () => {
    const rows = createChineseRows({ ...DEFAULT_CHINESE_CONFIG, content: '天 地\n人', mode: 'copy', repeatRows: 2 })
    expect(rows.map(row => row[0].character)).toEqual(['天', '天', '地', '地', '人', '人'])
    expect(rows.every(row => row.slice(1).every(cell => cell.character === ''))).toBe(true)
  })

  it('places a black example and colored tracing character in mixed rows', () => {
    const [row] = createChineseRows({ ...DEFAULT_CHINESE_CONFIG, content: '天', mode: 'mixed', columns: 6 })
    expect(row).toEqual([
      { character: '天', guide: false },
      { character: '天', guide: true },
      ...Array.from({ length: 4 }, () => ({ character: '', guide: false })),
    ])
  })

  it('fills tracing rows and leaves blank-mode rows empty', () => {
    const [tracing] = createChineseRows({ ...DEFAULT_CHINESE_CONFIG, content: '学', mode: 'trace' })
    const [blank] = createChineseRows({ ...DEFAULT_CHINESE_CONFIG, content: '学', mode: 'blank' })
    expect(tracing.every(cell => cell.character === '学' && cell.guide)).toBe(true)
    expect(blank.every(cell => cell.character === '' && !cell.guide)).toBe(true)
  })

  it('paginates all characters into physically fitting A4 rows', () => {
    const config = { ...DEFAULT_CHINESE_CONFIG, content: '天地人你我他春风花草树山水田', columns: 10, margin: 12 }
    const pages = createChinesePages(config)
    expect(pages.map(page => page.length)).toEqual([11, 3])
    expect(pages.flat().map(row => row[0].character).join('')).toBe(config.content)
    for (const page of pages) {
      expect(page.length * 18.6 + (page.length - 1) * 3).toBeLessThanOrEqual(243)
    }
  })

  it('reduces page capacity when larger cells and instructions need more space', () => {
    const pages = createChinesePages({ ...DEFAULT_CHINESE_CONFIG, content: '天地人你我他春风花草树山水田', columns: 6, margin: 20, instructions: '认真书写。' })
    expect(pages.map(page => page.length)).toEqual([7, 7])
  })

  it('uses the space freed by hiding student information', () => {
    const pages = createChinesePages({ ...DEFAULT_CHINESE_CONFIG, content: '天地人你我他春风花草树山', columns: 10, margin: 20, showHeader: false })
    expect(pages.map(page => page.length)).toEqual([12])
  })

  it('does not reserve instruction space for whitespace', () => {
    const pages = createChinesePages({ ...DEFAULT_CHINESE_CONFIG, content: '天地人你我他春风花草树', instructions: '   ' })
    expect(pages.map(page => page.length)).toEqual([11])
  })

  it('reserves enough space for a complete long title', () => {
    const pages = createChinesePages({ ...DEFAULT_CHINESE_CONFIG, content: '天地人你我他春风花草树', title: '认'.repeat(40) })
    expect(pages.map(page => page.length)).toEqual([10, 1])
  })

  it('generates one full blank practice sheet for empty content', () => {
    const pages = createChinesePages({ ...DEFAULT_CHINESE_CONFIG, content: ' \n ' })
    expect(pages).toHaveLength(1)
    expect(pages[0]).toHaveLength(11)
    expect(pages[0].flat().every(cell => cell.character === '')).toBe(true)
  })

  it('rejects invalid column counts without entering a non-progressing loop', () => {
    expect(() => createChineseRows({ ...DEFAULT_CHINESE_CONFIG, columns: 0 })).toThrow(RangeError)
  })
})
