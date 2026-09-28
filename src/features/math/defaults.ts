import type { MathConfig } from './types'

export const DEFAULT_MATH_CONFIG: MathConfig = {
  operations: ['add', 'subtract'],
  maxNumber: 10,
  count: 92,
  carryBorrow: 'any',
  allowZero: true,
  avoidDuplicates: true,
  columns: 4,
  format: 'horizontal',
  includeAnswers: false,
  title: '数学口算练习',
  instructions: '',
  showHeader: true,
  margin: 12,
}
