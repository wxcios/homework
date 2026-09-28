import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorksheetShell } from './WorksheetShell'

describe('WorksheetShell', () => {
  it('omits whitespace-only instructions from the printed sheet', () => {
    const { container } = render(<WorksheetShell title="练习" instructions={' \n '}>题目</WorksheetShell>)
    expect(container.querySelector('.worksheet-instructions')).toBeNull()
    expect(screen.getByText('题目')).toBeInTheDocument()
  })
})
