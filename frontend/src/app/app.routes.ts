import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HotelListComponent } from './pages/hotel-list/hotel-list.component';
import { HotelDetailComponent } from './pages/hotel-detail/hotel-detail.component';
import { BookingFormComponent } from './pages/booking-form/booking-form.component';
import { BookingConfirmationComponent } from './pages/booking-confirmation/booking-confirmation.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Hotel Booking Portal - Find Your Perfect Stay' },
  { path: 'hotels', component: HotelListComponent, title: 'Explore Hotels - Hotel Booking Portal' },
  { path: 'hotels/:id', component: HotelDetailComponent, title: 'Hotel Details - Hotel Booking Portal' },
  { path: 'booking', component: BookingFormComponent, title: 'Confirm Reservation - Hotel Booking Portal' },
  { path: 'confirmation/:reference', component: BookingConfirmationComponent, title: 'Booking Confirmed - Hotel Booking Portal' },
  { path: 'my-bookings', component: MyBookingsComponent, title: 'My Bookings - Hotel Booking Portal' },
  { path: '**', redirectTo: '' }
];
