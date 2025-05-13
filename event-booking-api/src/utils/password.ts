import bcrypt from "bcrypt";

/**
 * Hash a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hash
 * @param password The plain text password to check
 * @param hash The hashed password to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
