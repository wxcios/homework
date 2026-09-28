import { Button, Empty, Pagination, Space } from 'antd'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { getPreviewScale } from '../lib/preview'

export function PreviewStage({ pages, summary, onRefresh, emptyMessage = '调整左侧配置后即可预览' }: { pages: ReactNode[]; summary: string; onRefresh?: () => void; emptyMessage?: string }) {
  const canvas = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(0.5)
  const [zoomStep, setZoomStep] = useState(10)
  const [selectedPage, setSelectedPage] = useState(1)
  const [printing, setPrinting] = useState(false)
  const currentPage = Math.min(selectedPage, Math.max(1, pages.length))
  const hasPages = pages.length > 0
  if (selectedPage !== currentPage) setSelectedPage(currentPage)
  useEffect(() => {
    const media = window.matchMedia('print')
    // Native print and keyboard shortcuts must see every page before the browser snapshots the DOM.
    const beforePrint = () => flushSync(() => setPrinting(true))
    const afterPrint = () => flushSync(() => setPrinting(false))
    const mediaChange = (event: MediaQueryListEvent) => flushSync(() => setPrinting(event.matches))
    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)
    media.addEventListener('change', mediaChange)
    setPrinting(media.matches)
    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
      media.removeEventListener('change', mediaChange)
    }
  }, [])
  useLayoutEffect(() => {
    const target = canvas.current!
    const resize = () => setFit(getPreviewScale({ width: target.clientWidth - 40, height: target.clientHeight - 36 }))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(target)
    return () => observer.disconnect()
  }, [])
  const scale = fit * zoomStep / 10
  return <section className="preview-stage" aria-label="打印预览">
    <div className="preview-tools">
      <div className="preview-info"><span className="preview-live">实时预览</span><span className="preview-summary">{summary}</span></div>
      <div className="preview-actions">
        <Space.Compact>
          <Button aria-label="缩小预览" disabled={!hasPages || zoomStep === 4} onClick={() => setZoomStep(value => value - 1)}>−</Button>
          <span className="zoom-value" aria-label="缩放比例" title="屏幕显示比例；打印始终为 A4 原尺寸">{hasPages ? `${Math.round(scale * 100)}%` : '—'}</span>
          <Button aria-label="放大预览" disabled={!hasPages || zoomStep === 10} onClick={() => setZoomStep(value => value + 1)}>+</Button>
        </Space.Compact>
        <Button aria-label="适应" title="适应窗口，完整显示整页" disabled={!hasPages} onClick={() => setZoomStep(10)}>适应</Button>
        {onRefresh && <Button disabled={!hasPages} onClick={onRefresh}>换一批题</Button>}
        <Button type="primary" disabled={!hasPages} onClick={() => window.print()}>打印 / 导出 PDF</Button>
      </div>
    </div>
    <div className="preview-canvas" ref={canvas}>
      {hasPages ? <div className="paper-footprint" style={{ width: `${210 * 96 / 25.4 * scale}px`, height: `${297 * 96 / 25.4 * scale}px` }}>
        <div className="paper-scale" style={{ transform: `scale(${scale})` }}>
          {printing
            ? pages.map((page, index) => <div className="preview-page" key={index} data-active={index + 1 === currentPage}>{page}</div>)
            : <div className="preview-page" key={currentPage - 1} data-active="true">{pages[currentPage - 1]}</div>}
        </div>
      </div> : <Empty className="preview-empty" image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyMessage} />}
    </div>
    {pages.length > 1 && <div className="preview-pagination"><Pagination simple current={currentPage} pageSize={1} total={pages.length} onChange={setSelectedPage} /></div>}
  </section>
}
