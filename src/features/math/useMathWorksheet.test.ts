import { act, renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'
import type { MathOperation } from './types'
import { useMathWorksheet } from './useMathWorksheet'

it('enumerates the candidate space only once for a generation rule change', () => {
  const { result } = renderHook(useMathWorksheet)
  let enumerations = 0
  const operations: MathOperation[] = ['multiply']
  operations[Symbol.iterator] = () => {
    enumerations += 1
    return operations.values()
  }

  act(() => result.current.setConfig({ ...result.current.config, operations, maxNumber: 1, count: 1, allowZero: false }))

  expect(result.current.problems).toEqual([{ left: 1, right: 1, operator: '×' }])
  expect(result.current.error).toBeNull()
  expect(enumerations).toBe(1)
})

it('clears invalid questions and recovers when generation becomes possible', () => {
  const { result } = renderHook(useMathWorksheet)
  act(() => result.current.setConfig({ ...result.current.config, operations: ['multiply'], maxNumber: 1, count: 2, allowZero: false }))
  expect(result.current.problems).toEqual([])
  expect(result.current.error).toMatch(/最多生成 1 道不重复题/)

  act(() => result.current.update('title', '调整中的作业'))
  expect(result.current.problems).toEqual([])
  expect(result.current.error).toMatch(/最多生成 1 道不重复题/)

  act(() => result.current.update('avoidDuplicates', false))
  expect(result.current.problems).toEqual([
    { left: 1, right: 1, operator: '×' },
    { left: 1, right: 1, operator: '×' },
  ])
  expect(result.current.error).toBeNull()
})
