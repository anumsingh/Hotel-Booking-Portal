import { RoomType } from './room-type.model';

export interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  roomType?: RoomType;
}
