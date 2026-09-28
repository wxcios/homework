import { useState } from 'react'
import { DEFAULT_CHINESE_CONFIG } from './defaults'
import type { ChineseConfig } from './types'

export function useChineseWorksheet() {
  const [config, setConfig] = useState<ChineseConfig>(DEFAULT_CHINESE_CONFIG)
  const update = <K extends keyof ChineseConfig>(key: K, value: ChineseConfig[K]) => {
    setConfig(current => ({ ...current, [key]: value }))
  }
  return { config, setConfig, update }
}
