import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Hotel } from '../models/hotel.model';
import { AvailabilityResponse } from '../models/availability.model';
import { AlternativeHotel } from '../models/alternative-hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = `${environment.apiUrl}/hotels`;

  constructor(private http: HttpClient) {}

  getAllHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.apiUrl);
  }

  getHotelById(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
  }

  searchHotels(location?: string): Observable<Hotel[]> {
    let params = new HttpParams();
    if (location && location.trim()) {
      params = params.set('location', location.trim());
    }
    return this.http.get<Hotel[]>(`${this.apiUrl}/search`, { params });
  }

  checkAvailability(hotelId: number, checkIn: string, checkOut: string): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/${hotelId}/availability`, { params });
  }

  getAlternativeHotels(hotelId: number, checkIn: string, checkOut: string): Observable<AlternativeHotel[]> {
    const params = new HttpParams()
      .set('checkIn', checkIn)
      .set('checkOut', checkOut);
    return this.http.get<AlternativeHotel[]>(`${this.apiUrl}/${hotelId}/alternatives`, { params });
  }
}
