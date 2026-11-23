-- ============================================================
-- Hotel Booking Portal Database Schema & Seed Script
-- Database: hotel_booking_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_booking_db;
USE hotel_booking_db;

-- 1. Drop tables in foreign key dependency order
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS hotels;

-- 2. Create Hotels Table
CREATE TABLE hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hotels_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Room Types Table
CREATE TABLE room_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_name VARCHAR(255) NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_rooms INT NOT NULL,
    amenities VARCHAR(1000) NOT NULL,
    CONSTRAINT fk_room_types_hotel FOREIGN KEY (hotel_id) 
        REFERENCES hotels(id) ON DELETE CASCADE,
    INDEX idx_room_types_hotel_id (hotel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Bookings Table
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    hotel_id BIGINT NOT NULL,
    room_type_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_nights INT NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_hotel FOREIGN KEY (hotel_id) 
        REFERENCES hotels(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_room_type FOREIGN KEY (room_type_id) 
        REFERENCES room_types(id) ON DELETE RESTRICT,
    INDEX idx_bookings_reference (booking_reference),
    INDEX idx_bookings_guest_email (guest_email),
    INDEX idx_bookings_hotel_id (hotel_id),
    INDEX idx_bookings_room_type_id (room_type_id),
    INDEX idx_bookings_dates (check_in_date, check_out_date),
    INDEX idx_bookings_status (booking_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insert Sample Hotels & Room Types
-- Hotel 1: Grand Palace Hotel – Mumbai
INSERT INTO hotels (id, name, location, description, image_url) VALUES (
    1,
    'Grand Palace Hotel',
    'Mumbai',
    'Experience colonial heritage elegance and five-star luxury overlooking the iconic Arabian Sea in South Mumbai. Boasts opulent dining, personalized concierge, and tranquil ocean vistas.',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES (
    1,
    1,
    'Luxury Heritage Suite',
    5500.00,
    8,
    'Free High-Speed Wi-Fi, Sea Facing Balcony, Infinity Pool Access, Spa & Wellness, Complimentary Gourmet Breakfast, 24/7 Butler Service'
);

-- Hotel 2: Sea View Resort – Goa
INSERT INTO hotels (id, name, location, description, image_url) VALUES (
    2,
    'Sea View Resort',
    'Goa',
    'A pristine tropical paradise nestled directly upon the golden sands of Calangute Beach. Enjoy swaying palms, private sun decks, beachside dining, and thrilling water sports.',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES (
    2,
    2,
    'Deluxe Beachfront Villa',
    4200.00,
    6,
    'Private Beach Access, Outdoor Swimming Pool, Beachfront Cocktail Bar, Airport Shuttle, Free Breakfast, Watersports Equipment'
);

-- Hotel 3: Mountain Escape Resort – Manali
INSERT INTO hotels (id, name, location, description, image_url) VALUES (
    3,
    'Mountain Escape Resort',
    'Manali',
    'Perched amidst pine forests with panoramic vistas of the snow-capped Himalayan peaks. Features cozy cedar wood chalets, roaring fireplaces, and authentic alpine hospitality.',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES (
    3,
    3,
    'Premium Himalayan Chalet',
    3800.00,
    5,
    'Panoramic Snow Peaks View, Cedar Wood Fireplace, Central Heating, In-house Bakery & Cafe, Guided Trekking Tours, Heated Jacuzzi'
);

-- Hotel 4: Royal Comfort Hotel – Pune
INSERT INTO hotels (id, name, location, description, image_url) VALUES (
    4,
    'Royal Comfort Hotel',
    'Pune',
    'Situated in the vibrant heart of Pune''s premier business district. Offers contemporary luxury, soundproof executive suites, state-of-the-art workstations, and rooftop dining.',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES (
    4,
    4,
    'Executive Business Suite',
    2900.00,
    10,
    'Ultra Fast Fiber Wi-Fi, Ergonomic Workstation, Conference Facilities, Fitness Center, 24/7 Room Service, Airport Transfer'
);

-- Hotel 5: Green Valley Stay – Lonavala
INSERT INTO hotels (id, name, location, description, image_url) VALUES (
    5,
    'Green Valley Stay',
    'Lonavala',
    'A tranquil nature retreat surrounded by misty hills, lush waterfalls, and private manicured gardens. Perfect for families, couples, and weekend getaways from the bustling city.',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES (
    5,
    5,
    'Serene Garden Cottage',
    3500.00,
    4,
    'Private Garden Lawn, Swimming Pool with Cabanas, Evening Bonfire & BBQ, Nature Trails, Free Parking, Mountain View Terrace'
);

-- Hotel 6 (Additional in Mumbai for Smart Recommendations): Marine Bay Luxury Suites – Mumbai
INSERT INTO hotels (id, name, location, description, image_url) VALUES (
    6,
    'Marine Bay Luxury Suites',
    'Mumbai',
    'A contemporary waterfront boutique hotel located along Marine Drive, Mumbai. Features panoramic skyline vistas, rooftop infinity pool, and fine dining.',
    'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES (
    6,
    6,
    'Oceanview Deluxe King',
    4800.00,
    6,
    'Free Wi-Fi, Marine Drive Views, Rooftop Lounge, Infinity Pool, Gourmet Breakfast, Fitness Center'
);

-- Hotel 7 (Additional in Goa for Smart Recommendations): Sunset Palms Beach Resort – Goa
INSERT INTO hotels (id, name, location, description, image_url) VALUES (
    7,
    'Sunset Palms Beach Resort',
    'Goa',
    'A tranquil beachfront escape set amidst sprawling coconut groves in Candolim, North Goa. Features lagoon-style pools and authentic Goan seafood.',
    'https://images.unsplash.com/photo-1580835845971-a393b73bf370?auto=format&fit=crop&w=1200&q=80'
);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES (
    7,
    7,
    'Palm Lagoon Cottage',
    3900.00,
    7,
    'Free Wi-Fi, Lagoon Pool, Beach Access, Ayurvedic Spa, Seafood Restaurant, Bicycle Rental'
);
