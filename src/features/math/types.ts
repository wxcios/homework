import type { WorksheetSettings } from '../../lib/worksheet-layout'

export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide'
export type CarryBorrow = 'any' | 'with' | 'without'

export interface MathConfig extends WorksheetSettings {
  operations: MathOperation[]
  maxNumber: number
  count: number
  carryBorrow: CarryBorrow
  allowZero: boolean
  avoidDuplicates: boolean
  columns: number
  format: 'horizontal' | 'vertical'
  includeAnswers: boolean
}

export interface MathProblem {
  left: number
  operator: '+' | '-' | '×' | '÷'
  right: number
}
