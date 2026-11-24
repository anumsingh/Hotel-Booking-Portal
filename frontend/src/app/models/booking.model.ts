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
  id?: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  hotelId?: number;
  hotelName: string;
  hotelLocation: string;
  roomTypeId?: number;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  bookingStatus: BookingStatus;
  createdAt: string;
}

export interface BookingData {
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  hotelName: string;
  hotelLocation: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  bookingStatus: BookingStatus;
  createdAt: string;
}

export interface BookingLookupRequest {
  bookingReference: string;
  email: string;
}

export interface BookingLookupResponse {
  message: string;
  data: BookingData;
  verificationToken: string;
}

export interface CancelBookingRequest {
  email: string;
}

export interface SecureCancelBookingRequest {
  bookingReference: string;
  email: string;
  verificationToken: string;
}
