import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { PreviewStage } from './PreviewStage'

let resizePreview: () => void
let viewport: { width: number; height: number }

beforeEach(() => {
  viewport = { width: 900, height: 700 }
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('preview-canvas') ? viewport.width : 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('preview-canvas') ? viewport.height : 0
  })
  vi.stubGlobal('ResizeObserver', class {
    constructor(private callback: () => void) {}
    observe(target: HTMLElement) {
      if (target.classList.contains('preview-canvas')) resizePreview = this.callback
    }
    disconnect() {}
    unobserve() {}
  })
  vi.stubGlobal('matchMedia', () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }))
})

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('reaches both zoom limits in six clicks and restores the fitted view', () => {
  render(<PreviewStage pages={[<div key="page">练习纸</div>]} summary="1 页" />)
  const smaller = screen.getByRole('button', { name: '缩小预览' })
  const larger = screen.getByRole('button', { name: '放大预览' })
  expect(larger).toBeDisabled()
  for (let index = 0; index < 6; index++) fireEvent.click(smaller)
  expect(smaller).toBeDisabled()
  for (let index = 0; index < 6; index++) fireEvent.click(larger)
  expect(larger).toBeDisabled()
  fireEvent.click(smaller)
  fireEvent.click(screen.getByRole('button', { name: '适应' }))
  expect(larger).toBeDisabled()
})

it('keeps the clamped page when page count later increases', () => {
  const pages = [<div key="1">第一页</div>, <div key="2">第二页</div>, <div key="3">第三页</div>]
  const { container, rerender } = render(<PreviewStage pages={pages} summary="3 页" />)
  fireEvent.click(screen.getByTitle('Next Page'))
  fireEvent.click(screen.getByTitle('Next Page'))
  expect(container.querySelector('[data-active="true"]')).toHaveTextContent('第三页')
  rerender(<PreviewStage pages={pages.slice(0, 1)} summary="1 页" />)
  expect(container.querySelector('[data-active="true"]')).toHaveTextContent('第一页')
  rerender(<PreviewStage pages={pages} summary="3 页" />)
  expect(container.querySelector('[data-active="true"]')).toHaveTextContent('第一页')
})

it('shows the supplied empty message and disables paper actions without pages', () => {
  const { container } = render(<PreviewStage pages={[]} summary="0 页" emptyMessage="请调整出题范围" />)
  expect(screen.getByText('请调整出题范围')).toBeVisible()
  expect(container.querySelector('.paper-footprint')).not.toBeInTheDocument()
  for (const name of ['缩小预览', '放大预览', '适应', '打印 / 导出 PDF']) {
    expect(screen.getByRole('button', { name })).toBeDisabled()
  }
})

it('refits the entire paper when the preview area shrinks', () => {
  const { container } = render(<PreviewStage pages={[<div key="page">练习纸</div>]} summary="1 页" />)
  viewport = { width: 300, height: 400 }
  act(() => resizePreview())
  const footprint = container.querySelector<HTMLElement>('.paper-footprint')!
  expect(parseFloat(footprint.style.width)).toBeLessThanOrEqual(300)
  expect(parseFloat(footprint.style.height)).toBeLessThanOrEqual(400)
  expect(parseFloat(footprint.style.height)).toBeGreaterThan(300)
})

it('mounts only the selected page on screen, including after navigating', () => {
  const { container } = render(<PreviewStage pages={[<div key="1">第一页</div>, <div key="2">第二页</div>]} summary="2 页" />)
  expect(container.querySelectorAll('.preview-page')).toHaveLength(1)
  expect(screen.queryByText('第二页')).not.toBeInTheDocument()
  fireEvent.click(screen.getByTitle('Next Page'))
  expect(container.querySelectorAll('.preview-page')).toHaveLength(1)
  expect(screen.getByText('第二页')).toBeInTheDocument()
  expect(screen.queryByText('第一页')).not.toBeInTheDocument()
})

it('prepares all pages synchronously for native printing and releases them after cancel or completion', () => {
  const { container } = render(<PreviewStage pages={[<div key="1">第一页</div>, <div key="2">第二页</div>]} summary="2 页" />)
  fireEvent.click(screen.getByTitle('Next Page'))
  for (let attempt = 0; attempt < 2; attempt++) {
    act(() => { window.dispatchEvent(new Event('beforeprint')) })
    expect(container.querySelectorAll('.preview-page')).toHaveLength(2)
    act(() => { window.dispatchEvent(new Event('afterprint')) })
    expect(container.querySelectorAll('.preview-page')).toHaveLength(1)
    expect(screen.getByText('第二页')).toBeInTheDocument()
  }
})
