import { useState } from 'react'
import { DEFAULT_MATH_CONFIG } from './defaults'
import { generateWorksheet } from './logic'
import type { MathConfig } from './types'

const GENERATION_KEYS = ['operations', 'maxNumber', 'count', 'carryBorrow', 'allowZero', 'avoidDuplicates'] as const

export function useMathWorksheet() {
  const [worksheet, setWorksheet] = useState(() => ({
    config: DEFAULT_MATH_CONFIG,
    ...generateWorksheet(DEFAULT_MATH_CONFIG),
  }))
  const { config, problems, error } = worksheet
  const setConfig = (next: MathConfig) => {
    const rulesChanged = GENERATION_KEYS.some(key => next[key] !== config[key])
    setWorksheet({
      config: next,
      ...(rulesChanged ? generateWorksheet(next) : { problems, error }),
    })
  }
  const update = <K extends keyof MathConfig>(key: K, value: MathConfig[K]) => setConfig({ ...config, [key]: value })
  const generate = () => { if (!error) setWorksheet({ config, ...generateWorksheet(config) }) }
  return { config, problems, error, setConfig, update, generate }
}
