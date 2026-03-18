/**
 * Czech IČO (Identifikační číslo osoby) validation.
 *
 * IČO is exactly 8 digits. The last digit is a check digit computed as:
 *   sum = d1*8 + d2*7 + d3*6 + d4*5 + d5*4 + d6*3 + d7*2
 *   check = (11 - (sum % 11)) % 10
 *
 * Special case: if (sum % 11) === 0, check digit is 1
 * Special case: if (sum % 11) === 1, check digit is 0
 */

export interface IcoValidationResult {
  valid: boolean;
  /** Normalized 8-digit IČO (zero-padded) */
  normalized: string;
  /** Error message if invalid */
  error?: string;
}

export function validateIco(input: string): IcoValidationResult {
  // Strip whitespace and leading zeros for display, but keep for validation
  const cleaned = input.replace(/\s/g, '');

  if (!cleaned) {
    return { valid: false, normalized: '', error: 'Zadejte IČO' };
  }

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, normalized: cleaned, error: 'IČO obsahuje neplatné znaky' };
  }

  // Zero-pad to 8 digits (some old IČO are shorter)
  const padded = cleaned.padStart(8, '0');

  if (padded.length !== 8) {
    return { valid: false, normalized: padded, error: 'IČO musí mít 8 číslic' };
  }

  // All zeros is invalid
  if (padded === '00000000') {
    return { valid: false, normalized: padded, error: 'Neplatné IČO' };
  }

  // Compute check digit
  const digits = padded.split('').map(Number);
  const weights = [8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * weights[i];
  }

  const remainder = sum % 11;
  let expectedCheck: number;
  if (remainder === 0) expectedCheck = 1;
  else if (remainder === 1) expectedCheck = 0;
  else expectedCheck = 11 - remainder;

  if (digits[7] !== expectedCheck) {
    return {
      valid: false,
      normalized: padded,
      error: 'Neplatné IČO (kontrolní číslice nesouhlasí)',
    };
  }

  return { valid: true, normalized: padded };
}

/**
 * Quick format check — returns true if the input looks like it could be
 * a complete IČO (8 digits or fewer with valid chars). Used for debounce.
 */
export function isCompleteIco(input: string): boolean {
  const cleaned = input.replace(/\s/g, '');
  return /^\d{6,8}$/.test(cleaned);
}
