/**
 * EAN-13 Validation and Generation Utilities
 * 
 * Note: Real EANs must come from GS1 registration.
 * These functions are for internal testing, sandboxes, and development environments only.
 */

/**
 * Validates an EAN-13 barcode
 * @param ean - The EAN string to validate (must be 13 digits)
 * @returns true if valid, false otherwise
 */
export function validateEAN13(ean: string): boolean {
  if (!ean || typeof ean !== 'string') return false;
  
  const trimmedEan = ean.trim();
  
  // Must be exactly 13 digits
  if (!/^\d{13}$/.test(trimmedEan)) {
    return false;
  }

  const digits = trimmedEan.split('').map(Number);
  const checkDigit = digits[12]; // Last digit (13th)
  const first12 = digits.slice(0, 12);

  // Sum digits in odd positions (1-indexed, so indices 0, 2, 4, 6, 8, 10)
  const oddSum = first12.filter((_, i) => i % 2 === 0).reduce((sum, digit) => sum + digit, 0);
  
  // Sum digits in even positions and multiply by 3 (indices 1, 3, 5, 7, 9, 11)
  const evenSum = first12.filter((_, i) => i % 2 === 1).reduce((sum, digit) => sum + digit, 0) * 3;
  
  // Add both sums
  const totalSum = oddSum + evenSum;
  
  // Calculate check digit
  const calculatedCheckDigit = (10 - (totalSum % 10)) % 10;
  
  // Compare with the 13th digit
  return calculatedCheckDigit === checkDigit;
}

/**
 * Calculates the check digit for the first 12 digits of an EAN-13
 * @param first12Digits - String of 12 digits
 * @returns The check digit (0-9)
 */
export function calculateEAN13CheckDigit(first12Digits: string): number {
  if (!/^\d{12}$/.test(first12Digits)) {
    throw new Error('Must provide exactly 12 digits');
  }

  const digits = first12Digits.split('').map(Number);

  // Sum digits in odd positions (1-indexed, so indices 0, 2, 4, 6, 8, 10)
  const oddSum = digits.filter((_, i) => i % 2 === 0).reduce((sum, digit) => sum + digit, 0);
  
  // Sum digits in even positions and multiply by 3 (indices 1, 3, 5, 7, 9, 11)
  const evenSum = digits.filter((_, i) => i % 2 === 1).reduce((sum, digit) => sum + digit, 0) * 3;
  
  // Add both sums
  const totalSum = oddSum + evenSum;
  
  // Calculate check digit
  return (10 - (totalSum % 10)) % 10;
}

/**
 * Generates a valid EAN-13 for testing/internal use
 * 
 * ⚠️ WARNING: This should NOT be used for real commercial products.
 * Real EANs must come from GS1 registration.
 * 
 * @param prefix - GS1 prefix (default: '200' for internal/testing use)
 * @param productId - Optional product ID to incorporate into the EAN
 * @returns A valid EAN-13 string
 */
export function generateEAN13(prefix: string = '200', productId?: number): string {
  // Use prefix (3 digits) + random/manufacturer digits to make 12 digits
  let baseDigits = prefix.padStart(3, '0').substring(0, 3);
  
  // Add product ID or random digits to reach 12 digits
  if (productId !== undefined) {
    const productDigits = productId.toString().padStart(9, '0').substring(0, 9);
    baseDigits = baseDigits + productDigits;
  } else {
    // Generate random digits for the remaining 9 positions
    const randomDigits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
    baseDigits = baseDigits + randomDigits;
  }
  
  // Ensure we have exactly 12 digits
  baseDigits = baseDigits.padStart(12, '0').substring(0, 12);
  
  // Calculate check digit
  const checkDigit = calculateEAN13CheckDigit(baseDigits);
  
  // Return complete EAN-13
  return baseDigits + checkDigit.toString();
}

