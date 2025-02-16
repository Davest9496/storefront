import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { CheckoutFormComponent } from '../../components/forms/checkout-form/checkout-form.component';
import { SummaryComponent } from '@app/components/cart-summary/cart-summary.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [CommonModule, CheckoutFormComponent, SummaryComponent],
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss'],
})
export class CheckOutComponent implements OnInit {
  constructor(private location: Location) {} // Add constructor

  checkoutForm!: FormGroup;
  formStatus: boolean = false;


  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {}

  onFormStatusChange(isValid: boolean): void {
    this.formStatus = isValid;
    console.log('Form validity status:', isValid);
  }

  onFormValuesChange(formData: any): void {
    console.log('Form data:', formData);
    if (formData.paymentMethod === 'e-Money') {
      console.log('Processing e-money payment');
    } else {
      console.log('Processing cash on delivery');
    }
  }

  onFormReady(form: FormGroup): void {
    this.checkoutForm = form;
  }
}
