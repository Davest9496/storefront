import { Request, Response } from 'express';
import { OrderStore } from '../models/order.model';
import {
  isOrderStatusRequest,
  OrderStatusRequest,
} from '../types/request.types';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  isAppError,
  handleUnknownError,
} from '../utils/error.utils';

export class OrderController {
  private store: OrderStore;

  constructor() {
    this.store = new OrderStore();
  }

  // GET /orders
  getAllOrders = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const orders = await this.store.index();
      return res.json(orders);
    } catch (error: unknown) {
      console.error('Error in getAllOrders:', error);

      if (error instanceof Error) {
        return res.status(500).json({
          error: 'Failed to fetch orders',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };

  // GET /orders/:id
  getOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      const userId = req.user?.id;
      if (typeof userId === 'number' && order.user_id !== userId) {
        throw new ForbiddenError(
          'You do not have permission to view this order'
        );
      }

      return res.json(order);
    } catch (error: unknown) {
      console.error('Error in getOrder:', error);

      if (error instanceof Error) {
        if (isAppError(error)) {
          return res.status(error.statusCode).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to fetch order',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };

  // POST /orders
  createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (typeof userId !== 'number') {
        throw new ForbiddenError('Authentication required');
      }

      const newOrder = await this.store.create(userId);
      return res.status(201).json(newOrder);
    } catch (error: unknown) {
      console.error('Error in createOrder:', error);

      if (error instanceof Error) {
        if (isAppError(error)) {
          return res.status(error.statusCode).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to create order',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };

  // POST /orders/:id/products
  addProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      const { product_id, quantity } = req.body as { product_id: number; quantity: number };
      if (!product_id || !quantity) {
        throw new BadRequestError('Product ID and quantity are required');
      }

      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      const userId = req.user?.id;
      if (typeof userId === 'number' && order.user_id !== userId) {
        throw new ForbiddenError(
          'You do not have permission to modify this order'
        );
      }

      const result = await this.store.addProduct(orderId, product_id, quantity);
      return res.json(result);
    } catch (error: unknown) {
      console.error('Error in addProduct:', error);

      if (error instanceof Error) {
        if (isAppError(error)) {
          return res.status(error.statusCode).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to add product to order',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };

  // DELETE /orders/:id
  deleteOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      const userId = req.user?.id;
      if (typeof userId === 'number' && order.user_id !== userId) {
        throw new ForbiddenError(
          'You do not have permission to delete this order'
        );
      }

      await this.store.delete(orderId);
      return res.json({ message: 'Order deleted successfully' });
    } catch (error: unknown) {
      console.error('Error in deleteOrder:', error);

      if (error instanceof Error) {
        if (isAppError(error)) {
          return res.status(error.statusCode).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to delete order',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };

  // PATCH /orders/:id/status
  updateStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        throw new BadRequestError('Invalid order ID');
      }

      if (!isOrderStatusRequest(req.body)) {
        throw new BadRequestError('Invalid status update request');
      }

      const statusUpdate: OrderStatusRequest = req.body;

      const order = await this.store.show(orderId);
      if (!order) {
        throw new NotFoundError(`Order ${orderId} not found`);
      }

      const userId = req.user?.id;
      if (typeof userId === 'number' && order.user_id !== userId) {
        throw new ForbiddenError(
          'You do not have permission to update this order'
        );
      }

      const updatedOrder = await this.store.updateStatus(
        orderId,
        statusUpdate.status
      );
      return res.json(updatedOrder);
    } catch (error: unknown) {
      console.error('Error in updateStatus:', error);

      if (error instanceof Error) {
        if (isAppError(error)) {
          return res.status(error.statusCode).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to update order status',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };

  // GET /orders/user/:userId/current
  getCurrentOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        throw new BadRequestError('Invalid user ID');
      }

      const currentUserId = req.user?.id;
      if (typeof currentUserId === 'number' && userId !== currentUserId) {
        throw new ForbiddenError('You can only view your own current order');
      }

      const currentOrder = await this.store.getCurrentOrder(userId);
      if (!currentOrder) {
        return res.json({ message: 'No active order found' });
      }

      return res.json(currentOrder);
    } catch (error: unknown) {
      console.error('Error in getCurrentOrder:', error);

      if (error instanceof Error) {
        if (isAppError(error)) {
          return res.status(error.statusCode).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to fetch current order',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };

  // GET /orders/user/:userId/completed
  getCompletedOrders = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        throw new BadRequestError('Invalid user ID');
      }

      const currentUserId = req.user?.id;
      if (typeof currentUserId === 'number' && userId !== currentUserId) {
        throw new ForbiddenError('You can only view your own completed orders');
      }

      const completedOrders = await this.store.getCompletedOrders(userId);
      return res.json(completedOrders);
    } catch (error: unknown) {
      console.error('Error in getCompletedOrders:', error);

      if (error instanceof Error) {
        if (isAppError(error)) {
          return res.status(error.statusCode).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: 'Failed to fetch completed orders',
          details: handleUnknownError(error),
        });
      }

      return res.status(500).json({
        error: 'An unknown error occurred',
        details: 'Internal server error',
      });
    }
  };
}
