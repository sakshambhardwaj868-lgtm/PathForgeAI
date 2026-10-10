import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthSecurity {
  private static readonly SALT_ROUNDS = 12;

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  public static verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      if (decoded && decoded.userId && decoded.email) {
        return {
          userId: decoded.userId,
          email: decoded.email,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
