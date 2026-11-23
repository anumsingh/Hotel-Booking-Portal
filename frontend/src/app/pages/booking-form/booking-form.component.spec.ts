import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingFormComponent } from './booking-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingFormComponent, HttpClientTestingModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize the guest booking form', () => {
    expect(component.guestForm).toBeDefined();
    expect(component.guestForm.get('guestName')).toBeDefined();
    expect(component.guestForm.get('guestEmail')).toBeDefined();
  });

  it('should validate required fields', () => {
    const nameControl = component.guestForm.get('guestName');
    const emailControl = component.guestForm.get('guestEmail');

    nameControl?.setValue('');
    emailControl?.setValue('');
    expect(component.guestForm.valid).toBeFalse();

    nameControl?.setValue('A'); // less than 2 chars
    expect(nameControl?.valid).toBeFalse();

    nameControl?.setValue('John Doe');
    expect(nameControl?.valid).toBeTrue();

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalse();

    emailControl?.setValue('john.doe@example.com');
    expect(emailControl?.valid).toBeTrue();

    expect(component.guestForm.valid).toBeTrue();
  });
});
