import { useState } from 'react'
import { DEFAULT_MATH_CONFIG } from './defaults'
import { generateProblems, getGenerationError } from './logic'
import type { MathConfig } from './types'

const GENERATION_KEYS = ['operations', 'maxNumber', 'count', 'carryBorrow', 'allowZero', 'avoidDuplicates'] as const

export function useMathWorksheet() {
  const [worksheet, setWorksheet] = useState(() => ({
    config: DEFAULT_MATH_CONFIG,
    problems: generateProblems(DEFAULT_MATH_CONFIG),
    error: null as string | null,
  }))
  const { config, problems, error } = worksheet
  const setConfig = (next: MathConfig) => {
    const rulesChanged = GENERATION_KEYS.some(key => next[key] !== config[key])
    const nextError = rulesChanged ? getGenerationError(next) : error
    setWorksheet({
      config: next,
      error: nextError,
      problems: rulesChanged ? (nextError ? [] : generateProblems(next)) : problems,
    })
  }
  const update = <K extends keyof MathConfig>(key: K, value: MathConfig[K]) => setConfig({ ...config, [key]: value })
  const generate = () => { if (!error) setWorksheet({ ...worksheet, problems: generateProblems(config) }) }
  return { config, problems, error, setConfig, update, generate }
}
