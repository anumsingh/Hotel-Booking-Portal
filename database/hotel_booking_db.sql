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

-- 5. Insert Master Hotels & Room Types
INSERT INTO hotels (id, name, location, description, image_url) VALUES 
(1, 'Taj Lake Palace', 'Udaipur', 'A floating 18th-century white marble jewel resting on the serene waters of Lake Pichola. Features royal jharokhas, heritage courtyards, authentic Mewari fine dining, and private royal boat excursions.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'),
(2, 'The Oberoi Udaivilas', 'Udaipur', 'Perched along the banks of Lake Pichola with majestic dome pavilions, torch-lit corridors, cascading reflection pools, and world-renowned Rajasthani hospitality.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'),
(3, 'W Goa Beachfront Retreat', 'Goa', 'Vibrant beachside luxury nestled directly upon the golden sands of Vagator Beach beneath dramatic red cliffs. Features the iconic Rock Pool, private sundecks, and oceanfront dining.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'),
(4, 'Taj Fort Aguada Resort & Spa', 'Goa', 'Built directly upon the historic ramparts of a 16th-century Portuguese fortress overlooking Sinquerim Beach. Offers panoramic Arabian Sea sunsets, cliffside pools, and lush tropical gardens.', 'https://images.unsplash.com/photo-1580835845971-a393b73bf370?auto=format&fit=crop&w=1200&q=80'),
(5, 'The St. Regis Mumbai', 'Mumbai', 'India\'s premier luxury tower rising high above Lower Parel. Unmatched panoramic views across the Mumbai skyline and Arabian Sea, signature St. Regis Butler service, and Michelin-caliber dining.', 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80'),
(6, 'The Taj Mahal Palace', 'Mumbai', 'The legendary heritage landmark standing proudly facing the Gateway of India since 1903. An opulent sanctuary featuring Mughal and Florentine architecture, world-renowned fine dining, and harbour vistas.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'),
(7, 'Wildflower Hall Himalayan Sanctuary', 'Manali', 'Perched amidst 22 acres of fragrant cedar and pine forests at 8,250 feet with breathtaking panoramic views of snow-capped Himalayan peaks. Features roaring fireplaces, cedar chalets, and open-air heated whirlpools.', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'),
(8, 'The Leela Palace', 'Bengaluru', 'Spanning nine acres of cascading gardens and shimmering lagoons in Bengaluru. Ornate palace architecture echoing the grandeur of the Vijayanagara Empire with modern smart technology and regal comforts.', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80');

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES 
(1, 1, 'Grand Heritage Lake Suite', 9500.00, 8, 'Private Boat Transfer, Lake Pichola View, Royal Butler Service, Jiva Spa on Boat, Heritage Dining, Free High-Speed WiFi, Sunset Cruise'),
(2, 2, 'Premier Palace Suite with Semi-Private Pool', 8800.00, 6, 'Semi-Private Swimming Pool, Lake Panorama, Lakeside Al Fresco Dining, Oberoi Spa, 24/7 Concierge, Valet Parking, Free High-Speed WiFi'),
(3, 3, 'Marvelous Beach Cabana Villa', 6800.00, 7, 'Direct Beach Access, Rock Pool & Cocktail Bar, Away Spa, Oceanfront Dining, 24/7 Concierge, Free High-Speed WiFi, Watersports Equipment'),
(4, 4, 'Hermitage Sea-Facing Cottage', 5600.00, 8, 'Fortress Ramparts View, Cascading Infinity Pool, Jiva Ayurvedic Spa, Seafood Grills, Free High-Speed WiFi, Beachside Sunset Lounge'),
(5, 5, 'Skyline Presidential Suite', 7500.00, 10, 'Arabian Sea & Skyline Views, 24/7 St. Regis Butler, Rooftop Infinity Pool, Iridium Spa, Executive Lounge Access, Free High-Speed WiFi'),
(6, 6, 'Gateway Heritage Sea Suite', 8200.00, 9, 'Direct Gateway of India View, Historical Heritage Walk, Harbor Sunset Lounge, Taj Club Privileges, 24/7 Butler Service, Luxury Spa'),
(7, 7, 'Premier Mountain View Chalet', 6200.00, 5, 'Open-Air Heated Whirlpool, Cedar Wood Fireplace, Panoramic Snow Peaks View, Mountain Trekking & Biking, In-house Cedar Spa, Gourmet Alpine Dining'),
(8, 8, 'Royal Executive Garden Suite', 5900.00, 10, 'Private Lagoon View, High-Speed Fiber WiFi, Executive Business Lounge, Citrus Fine Dining, Luxury Spa & Wellness, Temperature-Controlled Pool');
