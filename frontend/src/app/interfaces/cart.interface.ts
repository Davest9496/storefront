export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface CartState {
  items: CartItem[];
  isVisible: boolean;
}
