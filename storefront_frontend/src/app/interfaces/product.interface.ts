
export interface Product {
  id: string;
  name: string;
  category: string;
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

export interface BoxItem {
  quantity: number;
  item: string;
}