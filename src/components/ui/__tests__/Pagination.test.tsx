import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Pagination, { ITEMS_PER_PAGE } from '../Pagination'

const renderPagination = (overrides: Partial<Parameters<typeof Pagination>[0]> = {}) => {
  const onPageChange = vi.fn()
  const { container } = render(
    <Pagination
      currentPage={2}
      totalPages={5}
      totalItems={45}
      onPageChange={onPageChange}
      {...overrides}
    />,
  )

  // The summary reads "Showing <start> to <end> of <total> items"; the numbers are
  // split across sibling <span>s and repeat, so assert on the whole line.
  const summary = () => container.firstElementChild?.firstElementChild?.textContent?.replace(/\s+/g, ' ').trim()

  return { onPageChange, summary }
}

describe('Pagination', () => {
  it('describes the visible slice of the current page', () => {
    const { summary } = renderPagination()

    expect(summary()).toBe('Showing 11 to 20 of 45 items')
  })

  it('clamps the end of the range to the total item count on the last page', () => {
    const { summary } = renderPagination({ currentPage: 5, totalItems: 45 })

    expect(summary()).toBe('Showing 41 to 45 of 45 items')
  })

  it('hides the page controls when there is only one page', () => {
    const { summary } = renderPagination({ currentPage: 1, totalPages: 1, totalItems: 4 })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(summary()).toBe('Showing 1 to 4 of 4 items')
  })

  it('shows the current position out of the total', () => {
    renderPagination()

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('steps one page back and forward', () => {
    const { onPageChange } = renderPagination()
    const [, previous, next] = screen.getAllByRole('button')

    fireEvent.click(previous)
    expect(onPageChange).toHaveBeenCalledWith(1)

    fireEvent.click(next)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('jumps to the first and last page', () => {
    const { onPageChange } = renderPagination()
    const buttons = screen.getAllByRole('button')

    fireEvent.click(buttons[0])
    expect(onPageChange).toHaveBeenCalledWith(1)

    fireEvent.click(buttons[3])
    expect(onPageChange).toHaveBeenCalledWith(5)
  })

  it('disables the backward controls on the first page', () => {
    renderPagination({ currentPage: 1 })
    const [first, previous, next, last] = screen.getAllByRole('button')

    expect(first).toBeDisabled()
    expect(previous).toBeDisabled()
    expect(next).toBeEnabled()
    expect(last).toBeEnabled()
  })

  it('disables the forward controls on the last page', () => {
    renderPagination({ currentPage: 5 })
    const [first, previous, next, last] = screen.getAllByRole('button')

    expect(first).toBeEnabled()
    expect(previous).toBeEnabled()
    expect(next).toBeDisabled()
    expect(last).toBeDisabled()
  })

  it('exports the page size the range calculation is based on', () => {
    expect(ITEMS_PER_PAGE).toBe(10)
  })
})
