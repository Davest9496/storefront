import { Router, Request, Response, NextFunction } from 'express';
import { ProductController } from '../../controllers/product.controller';
import { verifyAuthToken } from '../../middleware/auth.middleware';

const productRoutes = Router();
const controller = new ProductController();

const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<Response>
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Public routes
productRoutes.get('/', asyncHandler(controller.index));

productRoutes.get('/search', asyncHandler(controller.searchProducts));

productRoutes.get('/popular', asyncHandler(controller.getPopular));

productRoutes.get(
  '/category/:category',
  asyncHandler(controller.getByCategory)
);

productRoutes.get('/:id', asyncHandler(controller.show));

// Protected routes
productRoutes.post('/', verifyAuthToken, asyncHandler(controller.create));

productRoutes.put('/:id', verifyAuthToken, asyncHandler(controller.update));

productRoutes.delete('/:id', verifyAuthToken, asyncHandler(controller.delete));

export default productRoutes;
