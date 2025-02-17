import { Request, Response } from 'express';
import { ProductStore } from '../models/product.model';
import { CreateProductDTO } from '../types/shared.types';
import {
  NotFoundError,
  BadRequestError,
  DatabaseError,
} from '../utils/error.utils';

export class ProductController {
  private store: ProductStore;

  constructor() {
    this.store = new ProductStore();
  }

  // GET /products
  index = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const products = await this.store.index();
      return res.json(products);
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  // GET /products/:id
  show = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const product = await this.store.show(id);
      return res.json(product);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  // POST /products
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const productData = req.body as CreateProductDTO;

      // Validate required fields with type checking
      if (
        typeof productData.product_name !== 'string' ||
        typeof productData.price !== 'number' ||
        typeof productData.category !== 'string' ||
        productData.product_name.length === 0 ||
        productData.category.length === 0
      ) {
        return res.status(400).json({
          error:
            'Missing or invalid required fields: product_name, price, and category are required',
        });
      }

      // Validate price is positive with proper type checking
      if (typeof productData.price !== 'number' || productData.price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than 0' });
      }

      const newProduct = await this.store.create(productData);
      return res.status(201).json(newProduct);
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  // PUT /products/:id
  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const updates = req.body as Partial<CreateProductDTO>;

      // Validate price if provided with proper type checking
      if (
        'price' in updates &&
        (typeof updates.price !== 'number' || updates.price <= 0)
      ) {
        return res.status(400).json({ error: 'Price must be greater than 0' });
      }

      const updatedProduct = await this.store.update(id, updates);
      return res.json(updatedProduct);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof BadRequestError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  // DELETE /products/:id
  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      await this.store.delete(id);
      return res.json({ message: 'Product deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  // GET /products/category/:category
  getByCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { category } = req.params;
      if (typeof category !== 'string' || category.length === 0) {
        return res.status(400).json({ error: 'Valid category is required' });
      }

      const products = await this.store.getByCategory(category);
      return res.json(products);
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  // GET /products/popular
  getPopular = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const products = await this.store.getPopular();
      return res.json(products);
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };

  // GET /products/search
  searchProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { q } = req.query;
      if (typeof q !== 'string' || q.length === 0) {
        return res.status(400).json({ error: 'Valid search term is required' });
      }

      const products = await this.store.searchProducts(q);
      return res.json(products);
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
}
