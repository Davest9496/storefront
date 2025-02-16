import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../../controllers/user.controller';
import {
  verifyAuthToken,
  verifyUserAuthorization,
} from '../../middleware/auth.middleware';
import {
  validateUserCreate,
  validateUserUpdate,
} from '../../middleware/validation.middleware';

const userRoutes = Router();
const userController = new UserController();

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Get all users [token required]
userRoutes.get(
  '/',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await userController.index(req, res);
    res.json(result);
  })
);

// Get specific user [token required]
userRoutes.get(
  '/:id',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await userController.show(req, res);
    res.json(result);
  })
);

// Create new user
userRoutes.post(
  '/',
  validateUserCreate,
  asyncHandler(async (req, res) => {
    const result = await userController.create(req, res);
    res.json(result);
  })
);

// Update user [token required]
userRoutes.put(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  validateUserUpdate,
  asyncHandler(async (req, res) => {
    const result = await userController.update(req, res);
    res.json(result);
  })
);

// Update password [token required]
userRoutes.put(
  '/:id/password',
  verifyAuthToken,
  verifyUserAuthorization,
  asyncHandler(async (req, res) => {
    const result = await userController.updatePassword(req, res);
    res.json(result);
  })
);

// Delete user [token required]
userRoutes.delete(
  '/:id',
  verifyAuthToken,
  verifyUserAuthorization,
  asyncHandler(async (req, res) => {
    const result = await userController.delete(req, res);
    res.json(result);
  })
);

// Get user's recent orders [token required]
userRoutes.get(
  '/:id/orders/recent',
  verifyAuthToken,
  verifyUserAuthorization,
  asyncHandler(async (req, res) => {
    const result = await userController.getRecentOrders(req, res);
    res.json(result);
  })
);

export default userRoutes;
