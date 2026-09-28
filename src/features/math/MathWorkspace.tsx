import { Alert, Checkbox, Form, InputNumber, Radio, Select } from 'antd'
import { WorksheetShell } from '../../components/WorksheetShell'
import { WorksheetSettings } from '../../components/WorksheetSettings'
import { WorkspaceLayout } from '../../components/WorkspaceLayout'
import { getAnswer, paginateProblems } from './logic'
import type { MathConfig, MathOperation, MathProblem } from './types'
import type { useMathWorksheet } from './useMathWorksheet'

interface MathWorkspaceProps {
  worksheet: ReturnType<typeof useMathWorksheet>
  onSubjectChange: (subject: 'chinese' | 'math') => void
}

function Problem({ problem, format, answer }: { problem: MathProblem; format: MathConfig['format']; answer: boolean }) {
  if (format === 'vertical' && !answer) {
    return <div className="math-problem math-vertical">
      {problem.operator === '÷'
        ? <div className="math-division"><span>{problem.right}</span><span className="math-division-dividend">{problem.left}</span></div>
        : <div className="math-vertical-stack"><div>{problem.left}</div><div><span>{problem.operator}</span>{problem.right}</div><div className="math-vertical-line" /></div>}
    </div>
  }
  return <div className="math-problem"><span>{problem.left} {problem.operator === '-' ? '−' : problem.operator} {problem.right} =</span>{answer ? <span className="math-answer">{getAnswer(problem)}</span> : <span className="math-answer-blank" />}</div>
}

export function MathWorkspace({ worksheet, onSubjectChange }: MathWorkspaceProps) {
  const { config, problems, error, setConfig, update, generate } = worksheet
  const problemPages = error ? [] : paginateProblems(problems, config)
  const answerPages = !error && config.includeAnswers ? paginateProblems(problems, { ...config, format: 'horizontal', title: `${config.title} · 参考答案` }) : []
  const columnWidth = (210 - config.margin * 2 - (config.columns - 1) * 5) / config.columns
  // Reserve 39 mm at 13 pt for the longest answer, 100 × 100 = 10000.
  const answerFontSize = Math.min(13, 13 * columnWidth / 39)
  const renderPage = (page: MathProblem[], index: number, answer: boolean) => (
    <WorksheetShell key={`${answer ? 'answers' : 'questions'}-${index}`} title={answer ? `${config.title} · 参考答案` : config.title} margin={config.margin} instructions={config.instructions} showHeader={config.showHeader}>
      <div className="math-problems" style={{ gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))`, fontSize: answer ? `${answerFontSize}pt` : undefined }}>
        {page.map((problem, i) => <Problem key={i} problem={problem} format={config.format} answer={answer} />)}
      </div>
    </WorksheetShell>
  )
  const pages = [...problemPages.map((page, i) => renderPage(page, i, false)), ...answerPages.map((page, i) => renderPage(page, i, true))]
  const controls = <Form layout="vertical" size="small" className="workspace-form">
    <Form.Item label="运算类型">
      <Checkbox.Group value={config.operations} options={[
        { label: '加法 +', value: 'add', disabled: config.operations.length === 1 && config.operations[0] === 'add' },
        { label: '减法 −', value: 'subtract', disabled: config.operations.length === 1 && config.operations[0] === 'subtract' },
        { label: '乘法 ×', value: 'multiply', disabled: config.operations.length === 1 && config.operations[0] === 'multiply' },
        { label: '除法 ÷', value: 'divide', disabled: config.operations.length === 1 && config.operations[0] === 'divide' },
      ]} onChange={value => update('operations', value as MathOperation[])} />
    </Form.Item>
    <Form.Item label={<span>数值范围 <span className="field-note">（以内）</span></span>}>
      <Radio.Group block optionType="button" buttonStyle="solid" value={config.maxNumber} options={[10, 20, 50, 100]} onChange={event => update('maxNumber', event.target.value)} />
      <div className="number-with-unit"><InputNumber aria-label="数值范围" min={1} max={100} precision={0} value={config.maxNumber} onChange={value => { if (value !== null) update('maxNumber', Math.min(100, Math.max(1, Math.floor(value)))) }} /><span>以内</span></div>
      <p className="field-help">加减法结果不超过该范围；乘除法的两个运算数不超过该范围。</p>
    </Form.Item>
    <Form.Item label="题目数量">
      <Radio.Group block optionType="button" buttonStyle="solid" value={config.count} options={[20, 30, 40, 50]} onChange={event => update('count', event.target.value)} />
      <div className="number-with-unit"><InputNumber aria-label="题目数量" min={1} max={200} precision={0} value={config.count} onChange={value => { if (value !== null) update('count', Math.min(200, Math.max(1, Math.floor(value)))) }} /><span>题</span></div>
    </Form.Item>
    <Form.Item label="每行题数">
      <Radio.Group block optionType="button" buttonStyle="solid" value={config.columns} options={[2, 3, 4, 5].map(value => ({ label: `${value} 列`, value }))} onChange={event => update('columns', event.target.value)} />
    </Form.Item>
    <Form.Item label="题目形式">
      <Radio.Group block optionType="button" buttonStyle="solid" value={config.format} options={[{ label: '横式口算', value: 'horizontal' }, { label: '竖式计算', value: 'vertical' }]} onChange={event => update('format', event.target.value)} />
    </Form.Item>
    <Form.Item label="选项">
      <Checkbox.Group value={[...(config.allowZero ? ['zero'] : []), ...(config.avoidDuplicates ? ['unique'] : []), ...(config.includeAnswers ? ['answers'] : [])]} options={[{ label: '允许出现 0', value: 'zero' }, { label: '避免重复题目', value: 'unique' }, { label: '附答案页', value: 'answers' }]} onChange={value => setConfig({ ...config, allowZero: value.includes('zero'), avoidDuplicates: value.includes('unique'), includeAnswers: value.includes('answers') })} />
    </Form.Item>
    <Form.Item label="进退位">
      <Select aria-label="进退位" value={config.carryBorrow} options={[{ label: '不限进退位', value: 'any' }, { label: '需要进退位', value: 'with' }, { label: '不进退位', value: 'without' }]} onChange={value => update('carryBorrow', value)} />
    </Form.Item>
    {error && <Alert type="warning" title={error} showIcon className="generation-warning" />}
    <WorksheetSettings value={config} onChange={value => setConfig({ ...config, ...value })} />
  </Form>
  return <WorkspaceLayout subject="math" onSubjectChange={onSubjectChange} controls={controls} pages={pages} summary={`共 ${pages.length} 页 · A4 210×297mm · ${problems.length} 题`} onRefresh={error ? undefined : generate} emptyMessage={error ?? undefined} />
}
