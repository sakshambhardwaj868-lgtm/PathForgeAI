import { Request, Response, NextFunction } from 'express';
import { AuthSecurity, TokenPayload } from '../utils/token';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Bearer token.',
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const payload = AuthSecurity.verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token. Please log in again.',
    });
    return;
  }

  req.user = payload;
  next();
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = AuthSecurity.verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
