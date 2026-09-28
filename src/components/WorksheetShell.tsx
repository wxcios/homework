import type { ReactNode } from 'react'
import { getWorksheetLayout } from '../lib/worksheet-layout'

interface WorksheetShellProps {
  children: ReactNode
  title: string
  instructions?: string
  showHeader?: boolean
  margin?: number
}

export function WorksheetShell({ children, title, instructions = '', showHeader = true, margin = 12 }: WorksheetShellProps) {
  const layout = getWorksheetLayout({ title, instructions, showHeader, margin })
  return <article className="worksheet-sheet" style={{ padding: `${margin}mm` }} aria-label="A4 作业单">
    <header className="worksheet-header" style={{ height: `${layout.headerHeight}mm` }}>
      <h1>{layout.titleLines.map((line, index) => <span key={index}>{line}</span>)}</h1>
      {showHeader && <div className="worksheet-meta" aria-label="学生信息">
        <span>姓名：<i /></span><span>班级：<i /></span><span>日期：<i /></span><span>得分：<i /></span>
      </div>}
    </header>
    {layout.instructionLines.length > 0 && <p className="worksheet-instructions" style={{ height: `${layout.instructionsHeight}mm` }}>{layout.instructionLines.map((line, index) => <span key={index}>{line}</span>)}</p>}
    {children}
  </article>
}
