import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

// Interface for JWT payload
interface JWTPayload {
  user: {
    id: number;
    email: string;
  };
}

// Utility function to generate JWT token
export const generateToken = (userId: number, email: string): string => {
  try {
    return jwt.sign(
      {
        user: { id: userId, email },
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
  } catch (error) {
    throw new Error(`Error generating token: ${error}`);
  }
};

// Middleware to verify JWT token
export const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Token not provided' });
      return;
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JWTPayload;

      // Add user info to request object
      req.user = decoded.user;
      next();
    } catch (jwtError) {
      console.log(jwtError);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    res.status(401).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Middleware to verify user authorization
export const verifyUserAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (req.user.id !== userId) {
      res.status(403).json({ error: 'Unauthorized access to this resource' });
      return;
    }

    next();
  } catch (error) {
    res.status(403).json({
      error: 'Unauthorized',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Password utilities
export const passwordUtils = {
  getPepper: (): string => {
    const pepper = process.env.BCRYPT_PASSWORD;
    if (!pepper) {
      throw new Error('BCRYPT_PASSWORD (pepper) not set in environment');
    }
    return pepper;
  },

  getSaltRounds: (): number => {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
    if (isNaN(saltRounds)) {
      throw new Error('SALT_ROUNDS must be a valid number');
    }
    return saltRounds;
  },
};
