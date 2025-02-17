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
  const jwtSecret = process.env.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.length === 0) {
    throw new Error('JWT_SECRET is not properly configured');
  }

  try {
    return jwt.sign(
      {
        user: { id: userId, email },
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
  } catch (error) {
    // Using type guard for error
    if (error instanceof Error) {
      throw new Error(`Error generating token: ${error.message}`);
    }
    throw new Error('Unknown error generating token');
  }
};

// Middleware to verify JWT token
export const verifyAuthToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const jwtSecret = process.env.JWT_SECRET;

    if (typeof authHeader !== 'string' || authHeader.length === 0) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }

    if (typeof jwtSecret !== 'string' || jwtSecret.length === 0) {
      res.status(500).json({ error: 'JWT configuration error' });
      return;
    }

    // Extract token from "Bearer <token>"
    const [bearer, token] = authHeader.split(' ');

    if (
      bearer !== 'Bearer' ||
      typeof token !== 'string' ||
      token.length === 0
    ) {
      res.status(401).json({ error: 'Invalid authorization format' });
      return;
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      // Add user info to request object
      req.user = decoded.user;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({
      error: 'Authentication failed',
      details: errorMessage,
    });
  }
};

// Middleware to verify user authorization
export const verifyUserAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userIdParam = req.params.id;

    if (typeof userIdParam !== 'string' || userIdParam.length === 0) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const userId = parseInt(userIdParam, 10);

    if (isNaN(userId)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    if (req.user === undefined) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (req.user.id !== userId) {
      res.status(403).json({ error: 'Unauthorized access to this resource' });
      return;
    }

    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    res.status(403).json({
      error: 'Unauthorized',
      details: errorMessage,
    });
  }
};

// Password utilities
export const passwordUtils = {
  getPepper: (): string => {
    const pepper = process.env.BCRYPT_PASSWORD;
    if (typeof pepper !== 'string' || pepper.length === 0) {
      throw new Error('BCRYPT_PASSWORD (pepper) not set in environment');
    }
    return pepper;
  },

  getSaltRounds: (): number => {
    const saltRoundsStr = process.env.SALT_ROUNDS;
    if (typeof saltRoundsStr !== 'string' || saltRoundsStr.length === 0) {
      return 10; // Default value
    }

    const saltRounds = parseInt(saltRoundsStr, 10);
    if (isNaN(saltRounds)) {
      throw new Error('SALT_ROUNDS must be a valid number');
    }
    return saltRounds;
  },
};
