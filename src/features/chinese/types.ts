import type { WorksheetSettings } from '../../components/WorksheetSettings'

export type ChineseGridType = 'tian' | 'mi' | 'square'

export type ChinesePracticeMode = 'trace' | 'copy' | 'mixed' | 'blank'

export interface ChineseConfig extends WorksheetSettings {
  content: string
  gridType: ChineseGridType
  mode: ChinesePracticeMode
  columns: number
  color: string
  repeatRows: number
}

export interface ChineseCell {
  character: string
  guide: boolean
}
