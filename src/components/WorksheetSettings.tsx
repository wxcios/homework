import { Checkbox, Divider, Form, Input, Radio } from 'antd'

export interface WorksheetSettings {
  title: string
  instructions: string
  showHeader: boolean
  margin: number
}

export function WorksheetSettings({ value, onChange }: {
  value: WorksheetSettings
  onChange: (value: WorksheetSettings) => void
}) {
  return <>
    <Divider plain titlePlacement="left">通用设置</Divider>
    <Form.Item label="作业标题">
      <Input maxLength={40} value={value.title} onChange={event => onChange({ ...value, title: event.target.value })} />
    </Form.Item>
    <Form.Item label="要求 / 说明（可留空）">
      <Input maxLength={80} placeholder="例如：认真计算，书写工整。" value={value.instructions} onChange={event => onChange({ ...value, instructions: event.target.value })} />
    </Form.Item>
    <Form.Item label="抬头信息栏">
      <Checkbox checked={value.showHeader} onChange={event => onChange({ ...value, showHeader: event.target.checked })}>姓名 / 班级 / 日期 / 得分</Checkbox>
    </Form.Item>
    <Form.Item label="页边距">
      <Radio.Group className="preset-group" optionType="button" buttonStyle="solid" value={value.margin} onChange={event => onChange({ ...value, margin: event.target.value })} options={[10, 12, 15, 20].map(margin => ({ label: `${margin}mm`, value: margin }))} />
    </Form.Item>
  </>
}
