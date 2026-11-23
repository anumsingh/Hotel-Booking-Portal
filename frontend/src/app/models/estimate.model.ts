export interface EstimateRequest {
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
}

export interface EstimateResponse {
  hotelId: number;
  hotelName: string;
  roomTypeId: number;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  pricePerNight: number;
  totalAmount: number;
  isAvailable: boolean;
  availableRooms: number;
}
