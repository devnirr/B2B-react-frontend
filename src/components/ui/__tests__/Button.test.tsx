import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Button from '../Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save order</Button>)
    expect(screen.getByRole('button', { name: 'Save order' })).toBeInTheDocument()
  })

  it('calls onClick when pressed', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick while disabled', () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies the primary variant and medium size by default', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })

    expect(button.className).toContain('bg-primary-600')
    expect(button.className).toContain('px-4 py-2')
  })

  it('swaps in the danger variant classes', () => {
    render(<Button variant="danger">Delete</Button>)

    expect(screen.getByRole('button', { name: 'Delete' }).className).toContain('bg-red-600')
  })

  it('uses padding-only sizing for the icon variant', () => {
    render(<Button variant="icon" size="sm">x</Button>)
    const button = screen.getByRole('button', { name: 'x' })

    expect(button.className).toContain('p-1.5')
    expect(button.className).not.toContain('px-3')
  })

  it('stretches to full width when asked', () => {
    render(<Button fullWidth>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' }).className).toContain('w-full')
  })

  it('appends caller-supplied class names and forwards extra props', () => {
    render(
      <Button className="mt-4" type="submit">
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Save' })

    expect(button.className).toContain('mt-4')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
