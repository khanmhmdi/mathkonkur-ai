import bcrypt from 'bcrypt';

/**
 * Hashes a plain text password using bcrypt with 12 salt rounds.
 * @param plainText The plain text password to hash.
 * @returns A promise that resolves to the hashed password string.
 */
export async function hashPassword(plainText: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(plainText, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * Trims whitespace from the plain text password before comparison.
 * @param plainText The plain text password to check.
 * @param hash The hashed password to compare against.
 * @returns A promise that resolves to true if the passwords match, false otherwise.
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  const trimmedPassword = plainText.trim();
  return await bcrypt.compare(trimmedPassword, hash);
}
