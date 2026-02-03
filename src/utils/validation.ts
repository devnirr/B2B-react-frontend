// Validation utility functions
import { isValidPhoneNumber } from 'react-phone-number-input';

export const validators = {
  // Required field validation
  required: (value: string | number | undefined | null, fieldName: string): string | null => {
    if (value === undefined || value === null || value === '' || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validation
  email: (value: string | undefined): string | null => {
    if (!value || !value.trim()) return null; // Optional field
    const trimmedValue = value.trim();
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmedValue)) {
      return 'Please enter a valid email address';
    }
    // Check for common mistakes
    if (trimmedValue.includes('..')) {
      return 'Email cannot contain consecutive dots';
    }
    if (trimmedValue.startsWith('.') || trimmedValue.startsWith('@')) {
      return 'Email cannot start with a dot or @ symbol';
    }
    if (trimmedValue.endsWith('.') || trimmedValue.endsWith('@')) {
      return 'Email cannot end with a dot or @ symbol';
    }
    if (trimmedValue.length > 254) {
      return 'Email address is too long (maximum 254 characters)';
    }
    return null;
  },

  // Phone validation (using react-phone-number-input)
  phone: (value: string | undefined): string | null => {
    if (!value || !value.trim()) return null; // Optional field
    const trimmedValue = value.trim();
    
    // Check maximum length (E.164 standard: max 15 digits + country code)
    // Remove all non-digit characters except + to count actual digits
    const digitsOnly = trimmedValue.replace(/[^\d+]/g, '');
    // Maximum is + sign + 15 digits = 16 characters
    if (digitsOnly.length > 16) {
      return 'Phone number is too long. Maximum 15 digits allowed.';
    }
    
    if (!isValidPhoneNumber(trimmedValue)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  // Number validation
  number: (value: string | number | undefined, fieldName: string, min?: number, max?: number): string | null => {
    if (value === undefined || value === null || value === '') return null; // Optional field
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    if (min !== undefined && numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && numValue > max) {
      return `${fieldName} must be at most ${max}`;
    }
    return null;
  },

  // Integer validation
  integer: (value: string | number | undefined, fieldName: string, min?: number, max?: number): string | null => {
    if (value === undefined || value === null || value === '') return null; // Optional field
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(numValue) || !Number.isInteger(numValue)) {
      return `${fieldName} must be a valid integer`;
    }
    if (min !== undefined && numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && numValue > max) {
      return `${fieldName} must be at most ${max}`;
    }
    return null;
  },

  // String length validation
  minLength: (value: string | undefined, min: number, fieldName: string): string | null => {
    if (!value || !value.trim()) return null; // Optional field
    if (value.trim().length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: string | undefined, max: number, fieldName: string): string | null => {
    if (!value || !value.trim()) return null; // Optional field
    if (value.trim().length > max) {
      return `${fieldName} must be at most ${max} characters`;
    }
    return null;
  },

  // SKU validation (alphanumeric, dashes, underscores)
  sku: (value: string | undefined): string | null => {
    if (!value || !value.trim()) return 'SKU is required';
    const skuRegex = /^[A-Za-z0-9\-_]+$/;
    if (!skuRegex.test(value.trim())) {
      return 'SKU can only contain letters, numbers, dashes, and underscores';
    }
    if (value.trim().length < 3) {
      return 'SKU must be at least 3 characters';
    }
    if (value.trim().length > 50) {
      return 'SKU must be at most 50 characters';
    }
    return null;
  },

  // EAN validation (EAN-13 with check digit validation)
  ean: (value: string | undefined): string | null => {
    if (!value || !value.trim()) return null; // Optional field
    const trimmedValue = value.trim();
    
    // Must be exactly 13 digits
    if (!/^\d{13}$/.test(trimmedValue)) {
      return 'EAN must be exactly 13 digits';
    }

    // Validate check digit
    const digits = trimmedValue.split('').map(Number);
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
    if (calculatedCheckDigit !== checkDigit) {
      return 'Invalid EAN check digit';
    }
    
    return null;
  },

  // Comma-separated list validation
  commaSeparatedList: (value: string | undefined, fieldName: string, minItems: number = 1): string | null => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    const items = value.split(',').map((item) => item.trim()).filter(Boolean);
    if (items.length < minItems) {
      return `${fieldName} must have at least ${minItems} item${minItems > 1 ? 's' : ''}`;
    }
    return null;
  },

  // Postal code validation (basic - alphanumeric, 3-10 chars)
  postalCode: (value: string | undefined): string | null => {
    if (!value || !value.trim()) return null; // Optional field
    const postalCodeRegex = /^[A-Za-z0-9\s\-]{3,10}$/;
    if (!postalCodeRegex.test(value.trim())) {
      return 'Please enter a valid postal code';
    }
    return null;
  },

  // Tax ID validation (alphanumeric, dashes, spaces)
  taxId: (value: string | undefined): string | null => {
    if (!value || !value.trim()) return null; // Optional field
    const taxIdRegex = /^[A-Za-z0-9\s\-]+$/;
    if (!taxIdRegex.test(value.trim())) {
      return 'Please enter a valid tax ID';
    }
    return null;
  },

  // Positive number validation
  positive: (value: string | number | undefined, fieldName: string): string | null => {
    if (value === undefined || value === null || value === '') return null; // Optional field
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    if (numValue <= 0) {
      return `${fieldName} must be greater than 0`;
    }
    return null;
  },

  // Non-negative number validation (>= 0)
  nonNegative: (value: string | number | undefined, fieldName: string): string | null => {
    if (value === undefined || value === null || value === '') return null; // Optional field
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return `${fieldName} must be a valid number`;
    }
    if (numValue < 0) {
      return `${fieldName} must be 0 or greater`;
    }
    return null;
  },

  // Order line validation
  orderLine: (line: { productId: string; quantity: string; unitPrice: string }, index: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!line.productId) {
      errors[`orderLines.${index}.productId`] = 'Product is required';
    }
    if (!line.quantity || parseInt(line.quantity) <= 0) {
      errors[`orderLines.${index}.quantity`] = 'Quantity must be greater than 0';
    }
    if (!line.unitPrice || parseFloat(line.unitPrice) <= 0) {
      errors[`orderLines.${index}.unitPrice`] = 'Unit price must be greater than 0';
    }
    return errors;
  },

  // Password validation
  password: (value: string | undefined, fieldName: string = 'Password'): string | null => {
    if (!value || !value.trim()) {
      return `${fieldName} is required`;
    }
    if (value.length < 8) {
      return `${fieldName} must be at least 8 characters`;
    }
    if (value.length > 128) {
      return `${fieldName} must be at most 128 characters`;
    }
    // Check for at least one letter and one number
    if (!/[a-zA-Z]/.test(value)) {
      return `${fieldName} must contain at least one letter`;
    }
    if (!/[0-9]/.test(value)) {
      return `${fieldName} must contain at least one number`;
    }
    return null;
  },

  // Password match validation
  passwordMatch: (password: string, confirmPassword: string): string | null => {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },
};

// Helper function to validate all fields
export const validateForm = (
  formData: Record<string, any>,
  rules: Record<string, Array<(value: any, fieldName?: string) => string | null>>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = formData[field];

    for (const rule of fieldRules) {
      const error = rule(value, field);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
};

