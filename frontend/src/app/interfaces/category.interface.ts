import { BoxItem } from './product.interface';

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isNew: boolean;
  features: string[];
  includes: BoxItem[];
  images: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface Category {
  name: string;
  items: CategoryItem[];
}
