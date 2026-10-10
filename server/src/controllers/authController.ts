import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthSecurity } from '../utils/token';
import { registerSchema, loginSchema } from '../schemas/authSchemas';
import { Database } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable. Please verify MONGODB_URI in server/.env.',
      });
      return;
    }

    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid registration input.',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password, name } = validation.data;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'An account with this email address already exists. Please log in.',
        });
        return;
      }

      const passwordHash = await AuthSecurity.hashPassword(password);

      // Creating this first user document initializes the pathforge_ai database and users collection
      const user = await User.create({
        email,
        passwordHash,
        name,
      });

      const token = AuthSecurity.generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      });
    } catch (err: any) {
      console.error('[AuthController.register] Error creating user:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error during user registration.',
      });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable. Please verify MONGODB_URI in server/.env.',
      });
      return;
    }

    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid login credentials format.',
        details: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = validation.data;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      const isPasswordValid = await AuthSecurity.comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      const token = AuthSecurity.generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      });
    } catch (err: any) {
      console.error('[AuthController.login] Error verifying credentials:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error during login.',
      });
    }
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!Database.isReady()) {
      res.status(503).json({
        success: false,
        error: 'Database service is currently unavailable.',
      });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User account not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      });
    } catch (err: any) {
      console.error('[AuthController.getMe] Error fetching user profile:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error fetching user profile.',
      });
    }
  }
}
