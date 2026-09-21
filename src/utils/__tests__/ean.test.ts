import { describe, expect, it } from 'vitest'
import { calculateEAN13CheckDigit, generateEAN13, validateEAN13 } from '../ean'

describe('validateEAN13', () => {
  it('accepts real EAN-13 codes with a correct check digit', () => {
    expect(validateEAN13('4006381333931')).toBe(true)
    expect(validateEAN13('5901234123457')).toBe(true)
  })

  it('tolerates surrounding whitespace', () => {
    expect(validateEAN13('  4006381333931  ')).toBe(true)
  })

  it('rejects a code whose check digit does not match', () => {
    expect(validateEAN13('4006381333932')).toBe(false)
  })

  it('rejects codes that are not exactly 13 digits', () => {
    expect(validateEAN13('400638133393')).toBe(false)
    expect(validateEAN13('40063813339311')).toBe(false)
    expect(validateEAN13('400638133393X')).toBe(false)
  })

  it('rejects empty and non-string input', () => {
    expect(validateEAN13('')).toBe(false)
    expect(validateEAN13(undefined as unknown as string)).toBe(false)
    expect(validateEAN13(12345 as unknown as string)).toBe(false)
  })
})

describe('calculateEAN13CheckDigit', () => {
  it('computes the check digit for a known prefix', () => {
    expect(calculateEAN13CheckDigit('400638133393')).toBe(1)
    expect(calculateEAN13CheckDigit('590123412345')).toBe(7)
  })

  it('returns 0 rather than 10 when the weighted sum is a multiple of ten', () => {
    expect(calculateEAN13CheckDigit('000000000000')).toBe(0)
  })

  it('throws unless given exactly 12 digits', () => {
    expect(() => calculateEAN13CheckDigit('12345678901')).toThrow('Must provide exactly 12 digits')
    expect(() => calculateEAN13CheckDigit('1234567890123')).toThrow('Must provide exactly 12 digits')
    expect(() => calculateEAN13CheckDigit('12345678901a')).toThrow('Must provide exactly 12 digits')
  })
})

describe('generateEAN13', () => {
  it('produces a 13-digit code that validates', () => {
    const ean = generateEAN13()
    expect(ean).toMatch(/^\d{13}$/)
    expect(validateEAN13(ean)).toBe(true)
  })

  it('defaults to the 200 internal-use prefix', () => {
    expect(generateEAN13().startsWith('200')).toBe(true)
  })

  it('embeds the product id, zero-padded to nine digits', () => {
    const ean = generateEAN13('200', 42)
    expect(ean.slice(0, 12)).toBe('200000000042')
    expect(validateEAN13(ean)).toBe(true)
  })

  it('honours a custom prefix', () => {
    const ean = generateEAN13('978', 1)
    expect(ean.startsWith('978')).toBe(true)
    expect(validateEAN13(ean)).toBe(true)
  })
})
