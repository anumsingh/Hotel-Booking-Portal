import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  BookingRequest, 
  BookingResponse, 
  BookingData,
  BookingLookupRequest, 
  BookingLookupResponse, 
  CancelBookingRequest,
  SecureCancelBookingRequest 
} from '../models/booking.model';
import { EstimateRequest, EstimateResponse } from '../models/estimate.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  calculateEstimate(request: EstimateRequest): Observable<EstimateResponse> {
    return this.http.post<EstimateResponse>(`${this.apiUrl}/estimate`, request);
  }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.apiUrl, request);
  }

  /**
   * Secure booking lookup via POST /api/bookings/lookup.
   * Transmits booking reference and guest email in encrypted request body (HTTPS).
   * Eliminates URL parameter leakage and browser history storage.
   */
  lookupBooking(request: BookingLookupRequest): Observable<BookingLookupResponse> {
    return this.http.post<BookingLookupResponse>(`${this.apiUrl}/lookup`, request);
  }

  /**
   * Secure booking cancellation via POST /api/bookings/cancel.
   * Transmits booking reference, email, and short-lived verification session token.
   */
  secureCancelBooking(request: SecureCancelBookingRequest): Observable<BookingData> {
    return this.http.post<BookingData>(`${this.apiUrl}/cancel`, request);
  }

  /**
   * Legacy retrieval method.
   */
  getBooking(reference: string, email: string): Observable<BookingResponse> {
    const params = new HttpParams().set('email', email.trim());
    return this.http.get<BookingResponse>(`${this.apiUrl}/${reference.trim()}`, { params });
  }

  /**
   * Legacy cancellation method.
   */
  cancelBooking(reference: string, email: string): Observable<BookingResponse> {
    const payload: CancelBookingRequest = { email: email.trim() };
    return this.http.put<BookingResponse>(`${this.apiUrl}/${reference.trim()}/cancel`, payload);
  }
}
