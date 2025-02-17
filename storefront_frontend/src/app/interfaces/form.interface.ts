export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  paymentMethod: 'e-Money' | 'cash';
  eMoneyNumber?: string;
  eMoneyPin?: string;
}