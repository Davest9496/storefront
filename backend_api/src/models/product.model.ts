import { QueryResult } from 'pg';
import { query } from '../config/database.config';
import {
  Product,
  CreateProductDTO,
} from '../types/shared.types';
import {
  NotFoundError,
  BadRequestError,
  DatabaseError,
} from '../utils/error.utils';

export class ProductStore {
  async index(): Promise<Product[]> {
    try {
      const sql = 'SELECT * FROM products';
      const result: QueryResult<Product> = await query(sql);
      return result.rows;
    } catch (err) {
      throw new DatabaseError(
        `Could not get products: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async show(id: number): Promise<Product> {
    try {
      const sql = 'SELECT * FROM products WHERE id = $1';
      const result: QueryResult<Product> = await query(sql, [id]);

      if (result.rows.length === 0) {
        throw new NotFoundError(`Product with id ${id} not found`);
      }

      return result.rows[0];
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new DatabaseError(
        `Error fetching product ${id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async create(product: CreateProductDTO): Promise<Product> {
    try {
      const sql = `
        INSERT INTO products (
          product_name, 
          price, 
          category, 
          product_desc, 
          image_name, 
          product_features, 
          product_accessories
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `;

      // Convert arrays to PostgreSQL array format with proper type checking
      const features =
        Array.isArray(product.product_features) &&
        product.product_features.length > 0
          ? `{${product.product_features.join(',')}}`
          : null;

      const accessories =
        Array.isArray(product.product_accessories) &&
        product.product_accessories.length > 0
          ? `{${product.product_accessories.join(',')}}`
          : null;

      const values = [
        product.product_name,
        product.price,
        product.category,
        // Use null coalescing for optional string field
        product.product_desc ?? null,
        product.image_name,
        features,
        accessories,
      ];

      const result: QueryResult<Product> = await query(sql, values);
      return result.rows[0];
    } catch (err) {
      throw new DatabaseError(
        `Could not add product: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async update(
    id: number,
    updates: Partial<CreateProductDTO>
  ): Promise<Product> {
    try {
      // Check for product existence explicitly
      await this.show(id);

      // Build dynamic update query
      const allowedUpdates = [
        'product_name',
        'price',
        'category',
        'product_desc',
        'image_name',
        'product_features',
        'product_accessories',
      ] as const;

      type AllowedUpdate = (typeof allowedUpdates)[number];

      const updateEntries = Object.entries(updates).filter(
        (entry): entry is [AllowedUpdate, string | number | string[]] => {
          const [key, value] = entry;
          return (
            allowedUpdates.includes(key as AllowedUpdate) && value !== undefined
          );
        }
      );

      if (updateEntries.length === 0) {
        throw new BadRequestError('No valid updates provided');
      }

      const setClauses = updateEntries.map(
        ([key], index) => `${key} = $${index + 1}`
      );

      const values = updateEntries.map(([, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          return `{${value.join(',')}}`;
        }
        return value;
      });

      const sql = `
        UPDATE products 
        SET ${setClauses.join(', ')} 
        WHERE id = $${values.length + 1} 
        RETURNING *
      `;

      const result: QueryResult<Product> = await query(sql, [...values.map(value => Array.isArray(value) ? `{${value.join(',')}}` : value), id]);
      return result.rows[0];
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof BadRequestError)
        throw err;
      throw new DatabaseError(
        `Could not update product ${id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const sql = 'DELETE FROM products WHERE id = $1 RETURNING id';
      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        throw new NotFoundError(`Product with id ${id} not found`);
      }
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new DatabaseError(
        `Could not delete product ${id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async getByCategory(category: string): Promise<Product[]> {
    try {
      const validCategories = ['headphones', 'speakers', 'earphones'] as const;
      type ValidCategory = (typeof validCategories)[number];

      // Type guard for category validation
      const isValidCategory = (cat: string): cat is ValidCategory =>
        validCategories.includes(cat as ValidCategory);

      if (!isValidCategory(category)) {
        return [];
      }

      const sql = 'SELECT * FROM products WHERE category = $1';
      const result: QueryResult<Product> = await query(sql, [category]);
      return result.rows;
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes('invalid input value for enum product_category')
      ) {
        return [];
      }
      throw new DatabaseError(
        `Could not get products by category: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async getPopular(): Promise<Product[]> {
    try {
      const sql = `
        SELECT 
          p.*,
          COALESCE(SUM(op.quantity), 0) as total_sold
        FROM products p
        LEFT JOIN order_products op ON p.id = op.product_id
        LEFT JOIN orders o ON op.order_id = o.id
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
      `;

      interface ProductWithSales extends Product {
        total_sold: number;
      }

      const result: QueryResult<ProductWithSales> = await query(sql);

      // Explicitly remove total_sold from the returned products
      return result.rows.map(({ total_sold: _total_sold, ...product }) => product);
    } catch (err) {
      throw new DatabaseError(
        `Could not get top products: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const sql = `
        SELECT * FROM products 
        WHERE 
          product_name ILIKE $1 OR 
          product_desc ILIKE $1 OR 
          category::text ILIKE $1
      `;
      const searchPattern = `%${searchTerm}%`;
      const result: QueryResult<Product> = await query(sql, [searchPattern]);
      return result.rows;
    } catch (err) {
      throw new DatabaseError(
        `Could not search products: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
