import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormData {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  paymentMethod: 'e-Money' | 'cash';
  eMoneyNumber: string;
  eMoneyPin: string;
}

interface ErrorFields {
  [key: string]: {
    hasError: boolean;
    touched: boolean;
  };
}

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-form.component.html',
  styleUrls: ['./checkout-form.component.scss'],
})
export class CheckoutFormComponent implements OnInit {
  @Output() formStatusChange = new EventEmitter<boolean>();
  @Output() formValuesChange = new EventEmitter<FormData>();

  formData: FormData = {
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    paymentMethod: 'e-Money',
    eMoneyNumber: '',
    eMoneyPin: '',
  };

  patterns = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    name: /^[A-Za-z]+ [A-Za-z]+$/,
    phone:
      /^(?:(?:\+44\s?|0)(?:\d{2}\s?\d{4}\s?\d{4}|\d{3}\s?\d{3}\s?\d{4}|\d{4}\s?\d{6}))$/,
    postcode: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
    eMoneyNumber: /^\d{9}$/,
    eMoneyPin: /^\d{4}$/,
  };

  errors: ErrorFields = {};

  get showEMoneyFields(): boolean {
    return this.formData.paymentMethod === 'e-Money';
  }

  ngOnInit(): void {
    // Initialize error states
    Object.keys(this.formData).forEach((field) => {
      this.errors[field] = {
        hasError: false,
        touched: false,
      };
    });
    this.validateForm();
  }

  // Handle field focus
  onFieldFocus(field: string): void {
    this.errors[field].touched = true;
  }

  onPaymentMethodChange(value: 'e-Money' | 'cash') {
    this.formData.paymentMethod = value;
    if (!this.showEMoneyFields) {
      this.formData.eMoneyNumber = '';
      this.formData.eMoneyPin = '';
      this.errors['eMoneyNumber'].hasError = false;
      this.errors['eMoneyPin'].hasError = false;
    }
    this.validateForm();
  }

  onStringInputChange(
    field: Exclude<keyof FormData, 'paymentMethod'>,
    value: string
  ) {
    // @ts-ignore - We know this is safe because we excluded paymentMethod
    this.formData[field] = value;
    this.validateField(field);
    this.validateForm();
  }

  validateField(field: keyof FormData) {
    const value = this.formData[field];

    switch (field) {
      case 'name':
        this.errors[field].hasError = !value || !this.patterns.name.test(value);
        break;
      case 'email':
        this.errors[field].hasError =
          !value || !this.patterns.email.test(value);
        break;
      case 'phone':
        this.errors[field].hasError =
          !value || !this.patterns.phone.test(value);
        break;
      case 'addressLine1':
        this.errors[field].hasError = !value || value.length < 5;
        break;
      case 'city':
        this.errors[field].hasError = !value;
        break;
      case 'postcode':
        this.errors[field].hasError =
          !value || !this.patterns.postcode.test(value);
        break;
      case 'eMoneyNumber':
        if (this.showEMoneyFields) {
          this.errors[field].hasError =
            !value || !this.patterns.eMoneyNumber.test(value);
        }
        break;
      case 'eMoneyPin':
        if (this.showEMoneyFields) {
          this.errors[field].hasError =
            !value || !this.patterns.eMoneyPin.test(value);
        }
        break;
    }
  }

  validateForm() {
    (Object.keys(this.formData) as Array<keyof FormData>).forEach((field) => {
      this.validateField(field);
    });

    const isValid = !Object.values(this.errors).some((error) => error.hasError);

    this.formStatusChange.emit(isValid);
    if (isValid) {
      this.formValuesChange.emit(this.formData);
    }
  }
}