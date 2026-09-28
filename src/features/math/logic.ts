import type { MathConfig, MathProblem } from './types'
import { getWorksheetLayout } from '../../lib/worksheet-layout'

export function getAnswer(problem: MathProblem): number {
  switch (problem.operator) {
    case '+': return problem.left + problem.right
    case '-': return problem.left - problem.right
    case '×': return problem.left * problem.right
    case '÷': return problem.left / problem.right
  }
}

export function getCandidates(config: MathConfig): MathProblem[] {
  const candidates: MathProblem[] = []
  const min = config.allowZero ? 0 : 1
  for (const operation of config.operations) {
    for (let left = min; left <= config.maxNumber; left += 1) {
      for (let right = min; right <= config.maxNumber; right += 1) {
        if (operation === 'add' && left + right > config.maxNumber) continue
        if (operation === 'subtract' && left < right) continue
        if (operation === 'divide' && (right === 0 || left % right !== 0)) continue
        const operator = { add: '+', subtract: '-', multiply: '×', divide: '÷' }[operation] as MathProblem['operator']
        const problem = { left, right, operator }
        if (!config.allowZero && getAnswer(problem) === 0) continue
        if ((operation === 'add' || operation === 'subtract') && config.carryBorrow !== 'any') {
          const needsCarryBorrow = [1, 10].some(place => {
            const leftDigit = Math.floor(left / place) % 10
            const rightDigit = Math.floor(right / place) % 10
            return operation === 'add' ? leftDigit + rightDigit >= 10 : leftDigit < rightDigit
          })
          if ((config.carryBorrow === 'with') !== needsCarryBorrow) continue
        }
        candidates.push(problem)
      }
    }
  }
  return candidates
}

export function getGenerationError(config: MathConfig, candidates = getCandidates(config)): string | null {
  if (!config.operations.length) return '请至少选择一种运算。'
  if (!candidates.length) return '没有符合当前条件的题目，请调整范围或进退位设置。'
  if (config.avoidDuplicates && config.count > candidates.length) {
    return `当前条件最多生成 ${candidates.length} 道不重复题，请减少题量、扩大范围或关闭避免重复。`
  }
  return null
}

export function generateProblems(config: MathConfig, random = Math.random): MathProblem[] {
  const candidates = getCandidates(config)
  const error = getGenerationError(config, candidates)
  if (error) throw new Error(error)
  const problems: MathProblem[] = []
  for (let i = 0; i < config.count; i += 1) {
    const index = Math.floor(random() * candidates.length)
    problems.push(candidates[index])
    if (config.avoidDuplicates) candidates.splice(index, 1)
  }
  return problems
}

export function paginateProblems(problems: MathProblem[], config: MathConfig): MathProblem[][] {
  const rowHeight = config.format === 'horizontal' ? 10 : 28
  const rows = Math.max(1, Math.floor(getWorksheetLayout(config).contentHeight / rowHeight))
  const perPage = rows * config.columns
  const pages: MathProblem[][] = []
  for (let start = 0; start < problems.length; start += perPage) pages.push(problems.slice(start, start + perPage))
  return pages
}
