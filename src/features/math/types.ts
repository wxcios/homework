export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide'
export type CarryBorrow = 'any' | 'with' | 'without'

export interface MathConfig {
  operations: MathOperation[]
  maxNumber: number
  count: number
  carryBorrow: CarryBorrow
  allowZero: boolean
  avoidDuplicates: boolean
  columns: number
  format: 'horizontal' | 'vertical'
  includeAnswers: boolean
  title: string
  instructions: string
  showHeader: boolean
  margin: number
}

export interface MathProblem {
  left: number
  operator: '+' | '-' | '×' | '÷'
  right: number
}
