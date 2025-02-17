import { Request, Response } from 'express';
import { UserStore } from '../models/user.model';
import { generateToken } from '../middleware/auth.middleware';
import {
  CreateUserDTO,
  UpdatePasswordDTO,
  UpdateUserDTO,
} from '../types/shared.types';

export class UserController {
  private store: UserStore;

  constructor() {
    this.store = new UserStore();
  }

  index = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const users = await this.store.index();

      // Remove nullish check since store.index() should return an empty array if no users
      return res.json(users);
    } catch (error: unknown) {
      return res.status(500).json({
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  show = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await this.store.show(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const currentUserId = req.user?.id;
      if (typeof currentUserId !== 'number' || currentUserId !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to this resource',
        });
      }

      return res.json(user);
    } catch (error: unknown) {
      return res.status(500).json({
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userData = req.body as CreateUserDTO;

      // Validate required fields
      if (!this.validateCreateUserData(userData)) {
        return res.status(400).json({
          error:
            'Missing or invalid required fields: email, password, first_name, and last_name are required',
        });
      }

      const newUser = await this.store.create(userData);

      if (typeof newUser.id !== 'number') {
        throw new Error('Invalid user ID returned from database');
      }

      const token = generateToken(newUser.id, newUser.email);

      return res.status(201).json({
        user: newUser,
        token,
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes('Email already exists')
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const updates = req.body as UpdateUserDTO;

      // Validate update data
      if (!this.validateUpdateUserData(updates)) {
        return res.status(400).json({
          error: 'Invalid update data provided',
        });
      }

      const updatedUser = await this.store.update(userId, updates);
      return res.json(updatedUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('User not found')) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Email already exists')) {
          return res.status(400).json({ error: error.message });
        }
      }

      return res.status(500).json({
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const passwordData = req.body as UpdatePasswordDTO;

      // Validate password data
      if (!this.validatePasswordData(passwordData)) {
        return res.status(400).json({
          error: 'Current password and new password are required',
        });
      }

      await this.store.updatePassword(userId, passwordData);
      return res.json({ message: 'Password updated successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('User not found')) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Current password is incorrect')) {
          return res.status(400).json({ error: error.message });
        }
      }

      return res.status(500).json({
        error: 'Failed to update password',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      await this.store.delete(userId);
      return res.json({ message: 'User deleted successfully' });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('User not found')) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  getRecentOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const recentOrders = await this.store.getRecentOrders(userId);
      return res.json(recentOrders);
    } catch (error: unknown) {
      return res.status(500).json({
        error: 'Failed to fetch recent orders',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Helper methods for validation
  private validateCreateUserData(data: unknown): data is CreateUserDTO {
    if (data === null || typeof data !== 'object') return false;
    const userData = data as Record<string, unknown>;

    return (
      typeof userData.email === 'string' &&
      typeof userData.password === 'string' &&
      typeof userData.first_name === 'string' &&
      typeof userData.last_name === 'string' &&
      userData.email.length > 0 &&
      userData.password.length > 0 &&
      userData.first_name.length > 0 &&
      userData.last_name.length > 0
    );
  }

  private validateUpdateUserData(data: unknown): data is UpdateUserDTO {
    if (data === null || typeof data !== 'object') return false;
    const updateData = data as Record<string, unknown>;

    // All fields are optional, but if present must be non-empty strings
    return Object.entries(updateData).every(([key, value]) => {
      if (value === undefined) return true;
      if (key === 'email' || key === 'first_name' || key === 'last_name') {
        return typeof value === 'string' && value.length > 0;
      }
      return false;
    });
  }

  private validatePasswordData(data: unknown): data is UpdatePasswordDTO {
    if (data === null || typeof data !== 'object') return false;
    const passwordData = data as Record<string, unknown>;

    return (
      typeof passwordData.current_password === 'string' &&
      typeof passwordData.new_password === 'string' &&
      passwordData.current_password.length > 0 &&
      passwordData.new_password.length > 0
    );
  }
}
