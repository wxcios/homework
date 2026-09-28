import { WorksheetShell } from '../../components/WorksheetShell'
import type { ChineseCell, ChineseConfig } from './types'

interface ChineseWorksheetProps {
  config: ChineseConfig
  rows: ChineseCell[][]
}

export function ChineseWorksheet({ config, rows }: ChineseWorksheetProps) {
  const cellSize = (210 - config.margin * 2) / config.columns
  // Keep a 0.2 mm outline fully inside the SVG, including in print renderers.
  const borderWidth = 0.2 * 100 / cellSize
  const borderInset = borderWidth / 2

  return (
    <WorksheetShell
      title={config.title}
      instructions={config.instructions}
      showHeader={config.showHeader}
      margin={config.margin}
    >
      <section className="chinese-practice" style={{ display: 'grid', gap: '3mm' }}>
        {rows.map((row, rowIndex) => (
          <svg
            key={rowIndex}
            className="chinese-practice-row"
            viewBox={`0 0 ${config.columns * 100} 100`}
            width="100%"
            height={`${cellSize}mm`}
            role="img"
            aria-label={`第 ${rowIndex + 1} 行${row[0].character ? `：${row[0].character}` : '：空白练习'}`}
            style={{ display: 'block', overflow: 'visible' }}
          >
            <rect x={borderInset} y={borderInset} width={config.columns * 100 - borderWidth} height={100 - borderWidth} fill="none" stroke={config.color} strokeWidth={borderWidth} />
            {row.map((cell, index) => (
              <g key={index} transform={`translate(${index * 100} 0)`}>
                {index > 0 && <path d="M0 0V100" stroke={config.color} strokeWidth="0.7" />}
                {config.gridType !== 'square' && (
                  <path d="M50 0V100 M0 50H100" fill="none" stroke={config.color} strokeWidth="0.55" strokeDasharray="1.5 1.5" />
                )}
                {config.gridType === 'mi' && (
                  <path d="M0 0L100 100 M100 0L0 100" fill="none" stroke={config.color} strokeWidth="0.5" strokeDasharray="1.5 1.5" />
                )}
                {cell.character && (
                  <text
                    x="50"
                    y="50"
                    dy="0.35em"
                    textAnchor="middle"
                    fontSize="72"
                    fill={cell.guide ? config.color : '#111111'}
                    fillOpacity={cell.guide ? 0.72 : 1}
                    style={{ fontFamily: 'KaiTi, STKaiti, "楷体", "Kaiti SC", serif' }}
                  >
                    {cell.character}
                  </text>
                )}
              </g>
            ))}
          </svg>
        ))}
      </section>
    </WorksheetShell>
  )
}
