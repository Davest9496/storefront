import { Router, Request, Response, NextFunction } from 'express';
import { OrderController } from '../../controllers/order.controller';
import { verifyAuthToken } from '../../middleware/auth.middleware';

const orderRoutes = Router();
const orderController = new OrderController();

// Helper to wrap async route handlers
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Get all orders [token required]
orderRoutes.get(
  '/',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.getAllOrders(req, res);
    res.json(result);
  })
);

// Get specific order [token required]
orderRoutes.get(
  '/:id',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.getOrder(req, res);
    res.json(result);
  })
);

// Create new order [token required]
orderRoutes.post(
  '/',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.createOrder(req, res);
    res.json(result);
  })
);

// Add product to order [token required]
orderRoutes.post(
  '/:id/products',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.addProduct(req, res);
    res.json(result);
  })
);

// Delete order [token required]
orderRoutes.delete(
  '/:id',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.deleteOrder(req, res);
    res.json(result);
  })
);

// Update order status [token required]
orderRoutes.patch(
  '/:id/status',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.updateStatus(req, res);
    res.json(result);
  })
);

// Get current order for user [token required]
orderRoutes.get(
  '/user/:userId/current',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.getCurrentOrder(req, res);
    res.json(result);
  })
);

// Get completed orders for user [token required]
orderRoutes.get(
  '/user/:userId/completed',
  verifyAuthToken,
  asyncHandler(async (req, res) => {
    const result = await orderController.getCompletedOrders(req, res);
    res.json(result);
  })
);

export default orderRoutes;
