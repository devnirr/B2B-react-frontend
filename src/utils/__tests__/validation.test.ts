import { describe, expect, it } from 'vitest'
import { validateForm, validators } from '../validation'

describe('validators.required', () => {
  it('reports the field name when the value is missing', () => {
    expect(validators.required('', 'Name')).toBe('Name is required')
    expect(validators.required('   ', 'Name')).toBe('Name is required')
    expect(validators.required(null, 'Name')).toBe('Name is required')
    expect(validators.required(undefined, 'Name')).toBe('Name is required')
  })

  it('accepts non-empty values, including zero', () => {
    expect(validators.required('Acme', 'Name')).toBeNull()
    expect(validators.required(0, 'Quantity')).toBeNull()
  })
})

describe('validators.email', () => {
  it('treats a blank value as optional', () => {
    expect(validators.email('')).toBeNull()
    expect(validators.email(undefined)).toBeNull()
  })

  it('accepts ordinary addresses', () => {
    expect(validators.email('buyer@example.com')).toBeNull()
    expect(validators.email('first.last+tag@sub.example.co.uk')).toBeNull()
  })

  it('rejects malformed addresses', () => {
    expect(validators.email('not-an-email')).toBe('Please enter a valid email address')
    expect(validators.email('@example.com')).toBe('Please enter a valid email address')
    expect(validators.email('buyer@')).toBe('Please enter a valid email address')
  })

  it('allows a dotless host, so intranet addresses pass', () => {
    expect(validators.email('buyer@intranet')).toBeNull()
  })

  it('rejects addresses longer than 254 characters', () => {
    const long = `${'a'.repeat(250)}@example.com`
    expect(validators.email(long)).toBe('Email address is too long (maximum 254 characters)')
  })
})

describe('validators.number and validators.integer', () => {
  it('enforces the min and max bounds', () => {
    expect(validators.number('5', 'Price', 10)).toBe('Price must be at least 10')
    expect(validators.number('50', 'Price', 0, 20)).toBe('Price must be at most 20')
    expect(validators.number('15', 'Price', 10, 20)).toBeNull()
  })

  it('rejects values that are not numbers', () => {
    expect(validators.number('abc', 'Price')).toBe('Price must be a valid number')
    expect(validators.integer('abc', 'Quantity')).toBe('Quantity must be a valid integer')
  })

  it('treats an empty value as optional', () => {
    expect(validators.number('', 'Price', 10)).toBeNull()
    expect(validators.integer(undefined, 'Quantity', 1)).toBeNull()
  })
})

describe('validators.sku', () => {
  it('requires a value', () => {
    expect(validators.sku('')).toBe('SKU is required')
  })

  it('accepts letters, digits, dashes and underscores', () => {
    expect(validators.sku('ABC-123_x')).toBeNull()
  })

  it('rejects other characters and out-of-range lengths', () => {
    expect(validators.sku('AB C')).toBe('SKU can only contain letters, numbers, dashes, and underscores')
    expect(validators.sku('AB')).toBe('SKU must be at least 3 characters')
    expect(validators.sku('A'.repeat(51))).toBe('SKU must be at most 50 characters')
  })
})

describe('validators.ean', () => {
  it('is optional but checks the check digit when present', () => {
    expect(validators.ean('')).toBeNull()
    expect(validators.ean('4006381333931')).toBeNull()
    expect(validators.ean('4006381333932')).toBe('Invalid EAN check digit')
    expect(validators.ean('12345')).toBe('EAN must be exactly 13 digits')
  })
})

describe('validators.password', () => {
  it('requires at least 8 characters with a letter and a digit', () => {
    expect(validators.password('')).toBe('Password is required')
    expect(validators.password('ab1')).toBe('Password must be at least 8 characters')
    expect(validators.password('abcdefgh')).toBe('Password must contain at least one number')
    expect(validators.password('12345678')).toBe('Password must contain at least one letter')
    expect(validators.password('abcdefg1')).toBeNull()
  })

  it('uses the supplied field name in its messages', () => {
    expect(validators.password('', 'New password')).toBe('New password is required')
  })
})

describe('validators.orderLine', () => {
  it('flags every missing or non-positive field, keyed by row index', () => {
    expect(validators.orderLine({ productId: '', quantity: '0', unitPrice: '0' }, 2)).toEqual({
      'orderLines.2.productId': 'Product is required',
      'orderLines.2.quantity': 'Quantity must be greater than 0',
      'orderLines.2.unitPrice': 'Unit price must be greater than 0',
    })
  })

  it('returns no errors for a complete line', () => {
    expect(validators.orderLine({ productId: 'p-1', quantity: '3', unitPrice: '9.99' }, 0)).toEqual({})
  })
})

describe('validateForm', () => {
  it('collects the first error per field', () => {
    const errors = validateForm(
      { name: '', email: 'nope' },
      {
        name: [(value) => validators.required(value, 'Name'), (value) => validators.minLength(value, 3, 'Name')],
        email: [(value) => validators.email(value)],
      },
    )

    expect(errors).toEqual({
      name: 'Name is required',
      email: 'Please enter a valid email address',
    })
  })

  it('returns an empty object when every rule passes', () => {
    const errors = validateForm(
      { name: 'Acme', email: 'buyer@example.com' },
      {
        name: [(value) => validators.required(value, 'Name')],
        email: [(value) => validators.email(value)],
      },
    )

    expect(errors).toEqual({})
  })
})
