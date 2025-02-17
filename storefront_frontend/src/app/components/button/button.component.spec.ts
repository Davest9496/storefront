import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.variant).toBe('primary');
    expect(component.size).toBe('medium');
    expect(component.disabled).toBe(false);
    expect(component.fullWidth).toBe(false);
    expect(component.type).toBe('button');
  });

  it('should apply correct classes based on inputs', () => {
    component.variant = 'dark';
    component.size = 'large';
    component.fullWidth = true;
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button');
    expect(buttonElement.classList.contains('btn-dark')).toBe(true);
    expect(buttonElement.classList.contains('btn-large')).toBe(true);
    expect(buttonElement.classList.contains('btn-full')).toBe(true);
  });
});
