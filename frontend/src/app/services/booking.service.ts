import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookingRequest, BookingResponse, CancelBookingRequest } from '../models/booking.model';
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

  getBooking(reference: string, email: string): Observable<BookingResponse> {
    const params = new HttpParams().set('email', email.trim());
    return this.http.get<BookingResponse>(`${this.apiUrl}/${reference.trim()}`, { params });
  }

  cancelBooking(reference: string, email: string): Observable<BookingResponse> {
    const payload: CancelBookingRequest = { email: email.trim() };
    return this.http.put<BookingResponse>(`${this.apiUrl}/${reference.trim()}/cancel`, payload);
  }
}
