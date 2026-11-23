import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HotelService } from './hotel.service';
import { environment } from '../../environments/environment';
import { Hotel } from '../models/hotel.model';

describe('HotelService', () => {
  let service: HotelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HotelService]
    });
    service = TestBed.inject(HotelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all hotels via GET', () => {
    const mockHotels: Hotel[] = [
      { id: 1, name: 'Grand Palace Hotel', location: 'Mumbai', description: 'Desc', imageUrl: 'img.jpg' }
    ];

    service.getAllHotels().subscribe(hotels => {
      expect(hotels.length).toBe(1);
      expect(hotels[0].name).toBe('Grand Palace Hotel');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/hotels`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHotels);
  });

  it('should search hotels by location', () => {
    service.searchHotels('Goa').subscribe(hotels => {
      expect(hotels).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/hotels/search?location=Goa`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should check room availability for date range', () => {
    service.checkAvailability(1, '2026-12-10', '2026-12-13').subscribe(res => {
      expect(res.availableRooms).toBe(5);
      expect(res.isAvailable).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/hotels/1/availability?checkIn=2026-12-10&checkOut=2026-12-13`);
    expect(req.request.method).toBe('GET');
    req.flush({
      hotelId: 1,
      hotelName: 'Grand Palace',
      totalRooms: 8,
      availableRooms: 5,
      isAvailable: true,
      pricePerNight: 5000,
      totalAmount: 15000
    });
  });

  it('should fetch smart alternative hotels in same location', () => {
    service.getAlternativeHotels(1, '2026-12-10', '2026-12-13').subscribe(alts => {
      expect(alts.length).toBe(1);
      expect(alts[0].hotelName).toBe('Marine Bay Luxury Suites');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/hotels/1/alternatives?checkIn=2026-12-10&checkOut=2026-12-13`);
    expect(req.request.method).toBe('GET');
    req.flush([{
      hotelId: 6,
      hotelName: 'Marine Bay Luxury Suites',
      location: 'Mumbai',
      availableRooms: 4
    }]);
  });
});
