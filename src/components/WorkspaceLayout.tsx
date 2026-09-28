import { ConfigProvider, Radio } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { ReactNode } from 'react'
import { PreviewStage } from './PreviewStage'

export type ActiveSubject = 'chinese' | 'math'

interface WorkspaceLayoutProps {
  subject: ActiveSubject
  onSubjectChange: (subject: ActiveSubject) => void
  controls: ReactNode
  pages: ReactNode[]
  summary: string
  onRefresh?: () => void
  emptyMessage?: string
}

export function WorkspaceLayout({ subject, onSubjectChange, controls, pages, summary, onRefresh, emptyMessage }: WorkspaceLayoutProps) {
  return <ConfigProvider locale={zhCN} componentSize="small" button={{ autoInsertSpace: false }} theme={{
    token: { colorPrimary: '#3478f6', borderRadius: 6, fontSize: 12, controlHeightSM: 26, colorBorder: '#e1e7f0' },
    components: {
      Form: { labelFontSize: 12, labelHeight: 18, verticalLabelPadding: '0 0 4px', itemMarginBottom: 7 },
      Checkbox: { controlInteractiveSize: 13 },
      Radio: { buttonPaddingInline: 6, radioSize: 14, dotSize: 6 },
    },
  }}>
    <main className="workspace-layout">
      <aside className="workspace-sidebar" aria-label={`${subject === 'math' ? '数学' : '语文'}配置`}>
        <div className="brand"><div className="brand-mark">业</div><div><strong>家庭作业生成器</strong><small>A4 纸 · 语文 / 数学 · 直接打印</small></div></div>
        <div className="subject-switch"><Radio.Group block name="subject" aria-label="学科切换" value={subject} onChange={event => onSubjectChange(event.target.value)} options={[{ label: '语文', value: 'chinese' }, { label: '数学', value: 'math' }]} /></div>
        <div className="sidebar-controls">{controls}</div>
      </aside>
      <PreviewStage pages={pages} summary={summary} onRefresh={onRefresh} emptyMessage={emptyMessage} />
    </main>
  </ConfigProvider>
}
