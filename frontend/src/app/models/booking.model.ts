export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface BookingRequest {
  hotelId: number;
  roomTypeId: number;
  guestName: string;
  guestEmail: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
}

export interface BookingResponse {
  id: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  hotelId: number;
  hotelName: string;
  hotelLocation: string;
  roomTypeId: number;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  bookingStatus: BookingStatus;
  createdAt: string;
}

export interface CancelBookingRequest {
  email: string;
}
