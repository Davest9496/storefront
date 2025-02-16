import { User, Product, Order } from '../../types/shared.types';

export interface TestUser extends Omit<User, 'password_digest'> {
  id: number;
}

export interface TestProduct extends Product {
  id: number;
}

export interface TestOrder extends Order {
  id: number;
}

export interface AuthResponse {
  user: TestUser;
  token: string;
}

export interface TestUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface CreateUserResponse {
  user: TestUser;
  token: string;
}

export interface AuthResponse {
  user: TestUser;
  token: string;
}
