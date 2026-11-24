import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyBookingsComponent } from './my-bookings.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { of, throwError } from 'rxjs';

describe('MyBookingsComponent - Security Hardened', () => {
  let component: MyBookingsComponent;
  let fixture: ComponentFixture<MyBookingsComponent>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;

  beforeEach(async () => {
    bookingServiceSpy = jasmine.createSpyObj('BookingService', ['lookupBooking', 'secureCancelBooking']);

    await TestBed.configureTestingModule({
      imports: [MyBookingsComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: BookingService, useValue: bookingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize the secure retrieval form', () => {
    expect(component.retrieveForm).toBeDefined();
    expect(component.retrieveForm.get('reference')).toBeDefined();
    expect(component.retrieveForm.get('email')).toBeDefined();
  });

  it('should reject malformed booking references (must follow THB-YYYYMMDD-XXXXXX)', () => {
    const ref = component.retrieveForm.get('reference');
    ref?.setValue('INVALID_FORMAT_123');
    expect(ref?.valid).toBeFalse();

    ref?.setValue('THB-20261124-8517D9');
    expect(ref?.valid).toBeTrue();
  });

  it('should submit lookup via POST and clear sensitive form inputs upon success', () => {
    component.retrieveForm.patchValue({
      reference: 'THB-20261124-8517D9',
      email: 'guest@example.com'
    });

    const mockResponse = {
      message: 'Booking details retrieved successfully',
      verificationToken: 'token-abc-123',
      data: {
        bookingReference: 'THB-20261124-8517D9',
        guestName: 'Guest',
        guestEmail: 'guest@example.com',
        hotelName: 'Grand Palace Hotel',
        hotelLocation: 'Mumbai',
        roomName: 'Heritage Suite',
        checkInDate: '2026-12-10',
        checkOutDate: '2026-12-13',
        numberOfNights: 3,
        pricePerNight: 5000,
        totalAmount: 15000,
        bookingStatus: 'CONFIRMED' as const,
        createdAt: '2026-11-24T10:00:00'
      }
    };

    bookingServiceSpy.lookupBooking.and.returnValue(of(mockResponse));

    component.onRetrieveBooking();

    expect(bookingServiceSpy.lookupBooking).toHaveBeenCalledWith({
      bookingReference: 'THB-20261124-8517D9',
      email: 'guest@example.com'
    });
    expect(component.booking).toEqual(mockResponse.data);
    expect(component.verificationToken).toBe('token-abc-123');
    // Verify sensitive form fields were reset to protect privacy
    expect(component.retrieveForm.get('reference')?.value).toBeNull();
  });

  it('should display generic error message when lookup credentials do not match', () => {
    component.retrieveForm.patchValue({
      reference: 'THB-20261124-8517D9',
      email: 'guest@example.com'
    });

    bookingServiceSpy.lookupBooking.and.returnValue(
      throwError(() => ({ error: { message: 'Unable to retrieve booking with the provided details.' } }))
    );

    component.onRetrieveBooking();

    expect(component.errorMessage).toBe('Unable to retrieve booking with the provided details.');
    expect(component.booking).toBeNull();
    expect(component.verificationToken).toBeNull();
  });
});
