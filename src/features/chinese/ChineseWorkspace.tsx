import { Button, Form, Input, Radio, Space } from 'antd'
import { WorksheetSettings } from '../../components/WorksheetSettings'
import { WorkspaceLayout } from '../../components/WorkspaceLayout'
import { ChineseWorksheet } from './ChineseWorksheet'
import { createChinesePages } from './logic'
import type { useChineseWorksheet } from './useChineseWorksheet'

const PRESETS = [
  { label: '一年级 常用字', content: '天地人你我他春风花草树山水田' },
  { label: '天地人你我他', content: '天地人你我他' },
  { label: '日月水火', content: '日月水火山石田土' },
  { label: '词语用字', content: '学习快乐朋友学校老师同学' },
]

interface ChineseWorkspaceProps {
  worksheet: ReturnType<typeof useChineseWorksheet>
  onSubjectChange: (subject: 'chinese' | 'math') => void
}

export function ChineseWorkspace({ worksheet, onSubjectChange }: ChineseWorkspaceProps) {
  const { config, setConfig, update } = worksheet
  const pages = createChinesePages(config)
  const characterCount = Array.from(config.content.replace(/\s/g, '')).length
  const cellSize = ((210 - config.margin * 2) / config.columns).toFixed(1)

  const controls = (
    <Form layout="vertical" size="small" className="workspace-form">
      <Form.Item label="练习内容" extra="要练的字，逗号或空格可分隔">
        <Input.TextArea
          aria-label="练习内容"
          rows={2}
          maxLength={1000}
          value={config.content}
          onChange={event => update('content', event.target.value.replace(/[,，]/g, ' '))}
          placeholder="输入需要练习的汉字"
        />
      </Form.Item>
      <Space wrap size={[4, 4]} className="content-presets">
        {PRESETS.map(preset => (
          <Button key={preset.label} size="small" onClick={() => update('content', preset.content)}>
            {preset.label}
          </Button>
        ))}
      </Space>
      <Form.Item label="格子类型">
        <Radio.Group
          className="preset-group"
          optionType="button"
          value={config.gridType}
          onChange={event => update('gridType', event.target.value)}
          options={[
            { label: '田字格', value: 'tian' },
            { label: '米字格', value: 'mi' },
            { label: '方格', value: 'square' },
          ]}
        />
      </Form.Item>
      <Form.Item label="练习模式" extra={config.mode === 'mixed' ? '描写+跟写：第 1 格示范，第 2 格描红，其余自己写。' : undefined}>
        <Radio.Group
          className="preset-group"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          optionType="button"
          value={config.mode}
          onChange={event => update('mode', event.target.value)}
          options={[
            { label: '描写', value: 'trace' },
            { label: '跟写', value: 'copy' },
            { label: '描写+跟写', value: 'mixed' },
            { label: '空白默写', value: 'blank' },
          ]}
        />
      </Form.Item>
      <Form.Item label="每行格数">
        <Radio.Group
          className="preset-group"
          optionType="button"
          value={config.columns}
          onChange={event => update('columns', event.target.value)}
          options={[6, 8, 10, 12, 14].map(value => ({ label: value, value }))}
        />
      </Form.Item>
      <Form.Item label="每个字练几行">
        <Radio.Group
          className="preset-group"
          optionType="button"
          value={config.repeatRows}
          onChange={event => update('repeatRows', event.target.value)}
          options={[1, 2, 3].map(value => ({ label: `${value} 行`, value }))}
        />
      </Form.Item>
      <Form.Item label="描红颜色">
        <Radio.Group
          className="preset-group"
          optionType="button"
          value={config.color}
          onChange={event => update('color', event.target.value)}
          options={[
            { label: '浅红', value: '#e57373' },
            { label: '淡粉', value: '#e7a0b8' },
            { label: '浅灰', value: '#a3a3a3' },
          ]}
        />
      </Form.Item>
      <WorksheetSettings value={config} onChange={settings => setConfig(current => ({ ...current, ...settings }))} />
    </Form>
  )

  return (
    <WorkspaceLayout
      subject="chinese"
      onSubjectChange={onSubjectChange}
      controls={controls}
      summary={`共 ${pages.length} 页 · A4 210×297mm · ${characterCount} 字 / 格子 ${cellSize}mm`}
      pages={pages.map((rows, index) => <ChineseWorksheet key={index} config={config} rows={rows} />)}
    />
  )
}
