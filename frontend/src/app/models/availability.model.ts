export interface AvailabilityResponse {
  hotelId: number;
  hotelName: string;
  roomTypeId: number;
  roomName: string;
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
  isAvailable: boolean;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
}
