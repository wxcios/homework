import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import App from './App'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} })
  vi.stubGlobal('matchMedia', () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }))
})

it('keeps both settings sidebars and updates the copybook immediately without a generate button', () => {
  render(<App />)
  const subjects = screen.getByRole('radiogroup', { name: '学科切换' })
  expect(within(subjects).getAllByRole('radio').map(input => input.getAttribute('value'))).toEqual(['chinese', 'math'])
  expect(within(subjects).getByRole('radio', { name: '语文' })).toBeChecked()
  expect(screen.getByRole('complementary', { name: '语文配置' })).toBeVisible()
  fireEvent.change(screen.getByRole('textbox', { name: '练习内容' }), { target: { value: '天' } })
  expect(document.querySelectorAll('.chinese-practice-row')).toHaveLength(1)
  expect(screen.getAllByRole('img', { name: '第 1 行：天' })).toHaveLength(1)
  expect(screen.queryByRole('button', { name: '生成作业' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('数学', { exact: true }))
  expect(screen.getByRole('complementary', { name: '数学配置' })).toBeVisible()
  expect(screen.getByRole('spinbutton', { name: '题目数量' })).toHaveValue('92')
  expect(screen.getByRole('radio', { name: '数学' })).toBeChecked()
  expect(screen.getByRole('radio', { name: '语文' })).not.toBeChecked()
}, 15000)

it('retains custom Chinese content and options after switching subjects', () => {
  render(<App />)
  fireEvent.change(screen.getByLabelText('练习内容'), { target: { value: '春风' } })
  fireEvent.click(screen.getByText('2 行', { exact: true }))
  fireEvent.click(screen.getByText('数学', { exact: true }))
  expect(document.querySelectorAll('.chinese-practice-row')).toHaveLength(0)
  fireEvent.click(screen.getByText('语文', { exact: true }))
  expect(screen.getByLabelText('练习内容')).toHaveValue('春风')
  expect(document.querySelectorAll('.chinese-practice-row')).toHaveLength(4)
  expect(document.querySelectorAll('.math-problem')).toHaveLength(0)
}, 15000)

it('retains math settings and the generated problems after switching subjects', () => {
  render(<App />)
  fireEvent.click(screen.getByText('数学', { exact: true }))
  fireEvent.change(screen.getByLabelText('题目数量'), { target: { value: '20' } })
  fireEvent.blur(screen.getByLabelText('题目数量'))
  const problems = Array.from(document.querySelectorAll('.math-problem'), problem => problem.textContent)
  expect(problems).toHaveLength(20)
  fireEvent.click(screen.getByText('语文', { exact: true }))
  fireEvent.click(screen.getByText('数学', { exact: true }))
  expect(screen.getByLabelText('题目数量')).toHaveValue('20')
  expect(Array.from(document.querySelectorAll('.math-problem'), problem => problem.textContent)).toEqual(problems)
}, 15000)
