import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import { environment } from '../../environments/environment';
import { BookingRequest, BookingResponse } from '../models/booking.model';
import { EstimateRequest } from '../models/estimate.model';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request calculate estimate via POST', () => {
    const reqData: EstimateRequest = {
      hotelId: 1,
      checkInDate: '2026-12-10',
      checkOutDate: '2026-12-13'
    };

    service.calculateEstimate(reqData).subscribe(res => {
      expect(res.numberOfNights).toBe(3);
      expect(res.totalAmount).toBe(15000);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bookings/estimate`);
    expect(req.request.method).toBe('POST');
    req.flush({
      numberOfNights: 3,
      pricePerNight: 5000,
      totalAmount: 15000,
      isAvailable: true,
      availableRooms: 5
    });
  });

  it('should create booking via POST', () => {
    const bookingReq: BookingRequest = {
      hotelId: 1,
      roomTypeId: 1,
      guestName: 'Rajesh Sharma',
      guestEmail: 'rajesh@example.com',
      checkInDate: '2026-12-10',
      checkOutDate: '2026-12-13'
    };

    service.createBooking(bookingReq).subscribe(res => {
      expect(res.bookingReference).toBe('THB-20261123-50A1E3');
      expect(res.bookingStatus).toBe('CONFIRMED');
    });

    const req = httpMock.expectOne(environment.apiUrl + '/bookings');
    expect(req.request.method).toBe('POST');
    req.flush({
      bookingReference: 'THB-20261123-50A1E3',
      bookingStatus: 'CONFIRMED'
    });
  });

  it('should retrieve booking by reference and email', () => {
    service.getBooking('THB-20261123-50A1E3', 'rajesh@example.com').subscribe(res => {
      expect(res.guestName).toBe('Rajesh Sharma');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bookings/THB-20261123-50A1E3?email=rajesh@example.com`);
    expect(req.request.method).toBe('GET');
    req.flush({
      bookingReference: 'THB-20261123-50A1E3',
      guestName: 'Rajesh Sharma'
    });
  });

  it('should cancel active booking via PUT', () => {
    service.cancelBooking('THB-20261123-50A1E3', 'rajesh@example.com').subscribe(res => {
      expect(res.bookingStatus).toBe('CANCELLED');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bookings/THB-20261123-50A1E3/cancel`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ email: 'rajesh@example.com' });
    req.flush({
      bookingReference: 'THB-20261123-50A1E3',
      bookingStatus: 'CANCELLED'
    });
  });
});
