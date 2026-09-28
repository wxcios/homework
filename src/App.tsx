import { useState } from 'react'
import { ChineseWorkspace } from './features/chinese/ChineseWorkspace'
import { MathWorkspace } from './features/math/MathWorkspace'
import { useChineseWorksheet } from './features/chinese/useChineseWorksheet'
import { useMathWorksheet } from './features/math/useMathWorksheet'
import type { ActiveSubject } from './components/WorkspaceLayout'

export default function App() {
  const [subject, setSubject] = useState<ActiveSubject>('chinese')
  const chineseWorksheet = useChineseWorksheet()
  const mathWorksheet = useMathWorksheet()
  return subject === 'math'
    ? <MathWorkspace worksheet={mathWorksheet} onSubjectChange={setSubject} />
    : <ChineseWorkspace worksheet={chineseWorksheet} onSubjectChange={setSubject} />
}
