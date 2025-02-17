import { Request, Response, NextFunction } from 'express';
import { CreateUserDTO, UpdateUserDTO } from '../types/shared.types';

export const validateUserCreate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Type assertion with validation
  const userInput: unknown = req.body;

  // Type guard function to validate CreateUserDTO
  const isCreateUserDTO = (input: unknown): input is CreateUserDTO => {
    const user = input as Record<string, unknown>;
    return (
      typeof user?.email === 'string' &&
      typeof user?.password === 'string' &&
      typeof user?.first_name === 'string' &&
      typeof user?.last_name === 'string'
    );
  };

  if (!isCreateUserDTO(userInput)) {
    res.status(400).json({ error: 'Invalid user data format' });
    return;
  }

  const user = userInput;

  if (user.email.length === 0 || !user.email.includes('@')) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  if (user.password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  if (user.first_name.length === 0 || user.last_name.length === 0) {
    res.status(400).json({ error: 'First and last name are required' });
    return;
  }

  next();
};

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Type assertion with validation
  const updateInput: unknown = req.body;

  // Type guard function to validate UpdateUserDTO
  const isUpdateUserDTO = (input: unknown): input is UpdateUserDTO => {
    if (typeof input !== 'object' || input === null) {
      return false;
    }

    const updates = input as Record<string, unknown>;
    return Object.entries(updates).every(([key, value]) => {
      switch (key) {
        case 'email':
          return typeof value === 'string';
        case 'first_name':
        case 'last_name':
          return typeof value === 'string';
        default:
          return false;
      }
    });
  };

  if (!isUpdateUserDTO(updateInput)) {
    res.status(400).json({ error: 'Invalid update data format' });
    return;
  }

  const updates = updateInput;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No update fields provided' });
    return;
  }

  if (
    typeof updates.email === 'string' &&
    (updates.email.length === 0 || !updates.email.includes('@'))
  ) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  if ('password' in updates) {
    res.status(400).json({
      error: 'Password cannot be updated through this endpoint',
    });
    return;
  }

  next();
};
