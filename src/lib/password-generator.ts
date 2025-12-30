/**
 * Secure password generator utility
 * Generates cryptographically secure random passwords
 */

/**
 * Generate a secure random password
 * @param length - Length of the password (default: 16)
 * @param options - Options for password generation
 * @returns Generated password string
 */
export function generateSecurePassword(
  length: number = 16,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  // Character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Build character set based on options
  let charset = '';
  const requiredChars: string[] = [];

  if (includeUppercase) {
    charset += uppercase;
    requiredChars.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
  }
  if (includeLowercase) {
    charset += lowercase;
    requiredChars.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
  }
  if (includeNumbers) {
    charset += numbers;
    requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
  }
  if (includeSymbols) {
    charset += symbols;
    requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
  }

  if (charset.length === 0) {
    throw new Error('At least one character type must be included');
  }

  // Generate random password
  let password = '';
  const randomValues = new Uint32Array(length - requiredChars.length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < randomValues.length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  // Add required characters and shuffle
  const allChars = (password + requiredChars.join('')).split('');
  
  // Fisher-Yates shuffle
  for (let i = allChars.length - 1; i > 0; i--) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    const j = randomValues[0] % (i + 1);
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join('');
}

/**
 * Calculate password strength score
 * @param password - Password to evaluate
 * @returns Strength score from 0 to 4
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (password.length === 0) {
    return { score: 0, label: '', color: '' };
  }

  if (password.length < 8) {
    return { score: 1, label: 'Weak', color: 'bg-red-500' };
  }

  let score = 1;

  // Length bonus
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  return { score: 4, label: 'Strong', color: 'bg-green-500' };
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
