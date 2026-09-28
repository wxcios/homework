import { describe, expect, it } from 'vitest'
import { generateProblems, getAnswer, getCandidates, paginateProblems } from './logic'
import { DEFAULT_MATH_CONFIG } from './defaults'

const base = { ...DEFAULT_MATH_CONFIG, allowZero: true, avoidDuplicates: false }

describe('generateProblems', () => {
  it('creates only exact division problems with non-zero divisors', () => {
    const problems = generateProblems({ ...base, operations: ['divide'], maxNumber: 20, count: 12, carryBorrow: 'any' })

    expect(problems).toHaveLength(12)
    problems.forEach((problem) => {
      expect(problem.operator).toBe('÷')
      expect(problem.right).toBeGreaterThan(0)
      expect(problem.left % problem.right).toBe(0)
    })
  })

  it('keeps subtraction answers non-negative', () => {
    const problems = generateProblems({ ...base, operations: ['subtract'], maxNumber: 20, count: 12, carryBorrow: 'any' })

    expect(problems.every((problem) => problem.left >= problem.right)).toBe(true)
  })

  it('honors requested carrying in addition', () => {
    const problems = generateProblems({ ...base, operations: ['add'], maxNumber: 20, count: 8, carryBorrow: 'with' })

    expect(problems.every((problem) => problem.left % 10 + (problem.right % 10) >= 10)).toBe(true)
  })

  it('keeps addition results within the selected range', () => {
    const problems = generateProblems({ ...base, operations: ['add'], maxNumber: 10 }, () => 0.99)
    expect(problems.every(problem => problem.left + problem.right <= 10)).toBe(true)
  })

  it('excludes zero operands and zero answers when zero is disabled', () => {
    const problems = generateProblems({ ...base, operations: ['subtract'], allowZero: false }, () => 0)
    expect(problems.every(problem => problem.left > problem.right && problem.right > 0)).toBe(true)
  })

  it('samples distinct problems without retry loops even with fixed randomness', () => {
    const problems = generateProblems({ ...base, operations: ['add'], maxNumber: 10, count: 20, avoidDuplicates: true }, () => 0)
    expect(new Set(problems.map(problem => `${problem.left}${problem.operator}${problem.right}`)).size).toBe(20)
  })

  it('reports impossible distinct counts instead of generating duplicates', () => {
    expect(() => generateProblems({ ...base, operations: ['add'], maxNumber: 1, count: 20, avoidDuplicates: true })).toThrow(/最多.*3/)
  })

  it('reports an impossible carry requirement rather than silently ignoring it', () => {
    expect(() => generateProblems({ ...base, operations: ['add'], maxNumber: 5, carryBorrow: 'with' })).toThrow(/没有符合/)
  })

  it('rejects an empty operation selection', () => {
    expect(() => generateProblems({ ...base, operations: [] })).toThrow(/至少/)
  })

  it('recognizes carrying and borrowing across the hundreds boundary', () => {
    const additions = getCandidates({ ...base, operations: ['add'], maxNumber: 100, carryBorrow: 'with' })
    expect(additions).toContainEqual({ left: 50, right: 50, operator: '+' })
    const subtractions = getCandidates({ ...base, operations: ['subtract'], maxNumber: 100, carryBorrow: 'with' })
    expect(subtractions).toContainEqual({ left: 100, right: 10, operator: '-' })
  })

  it('splits large sets into complete A4 pages without dropping problems', () => {
    const problems = generateProblems({ ...base, count: 200 })
    const pages = paginateProblems(problems, { ...base, count: 200 })
    expect(pages.map(page => page.length)).toEqual([96, 96, 8])
    expect(pages.flat()).toEqual(problems)
    expect(paginateProblems(problems, { ...base, format: 'vertical' })[0]).toHaveLength(32)
  })

  it('provides correct answers for each printed operation', () => {
    expect(getAnswer({ left: 3, right: 4, operator: '+' })).toBe(7)
    expect(getAnswer({ left: 9, right: 2, operator: '-' })).toBe(7)
    expect(getAnswer({ left: 3, right: 4, operator: '×' })).toBe(12)
    expect(getAnswer({ left: 12, right: 4, operator: '÷' })).toBe(3)
  })

  it('accounts for wrapped titles and the longer answer title when paginating', () => {
    const problems = generateProblems({ ...base, count: 200 })
    const config = { ...base, margin: 20, title: '认'.repeat(40) }
    expect(paginateProblems(problems, config).map(page => page.length)).toEqual([84, 84, 32])
    expect(paginateProblems(problems, { ...config, title: `${config.title} · 参考答案` }).map(page => page.length)).toEqual([80, 80, 40])
  })
})
