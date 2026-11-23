-- Seed data for hotels and room_types
INSERT INTO hotels (id, name, location, description, image_url) VALUES 
(1, 'Grand Palace Hotel', 'Mumbai', 'Experience colonial heritage elegance and five-star luxury overlooking the iconic Arabian Sea in South Mumbai. Boasts opulent dining, personalized concierge, and tranquil ocean vistas.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'),
(2, 'Sea View Resort', 'Goa', 'A pristine tropical paradise nestled directly upon the golden sands of Calangute Beach. Enjoy swaying palms, private sun decks, beachside dining, and thrilling water sports.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'),
(3, 'Mountain Escape Resort', 'Manali', 'Perched amidst pine forests with panoramic vistas of the snow-capped Himalayan peaks. Features cozy cedar wood chalets, roaring fireplaces, and authentic alpine hospitality.', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'),
(4, 'Royal Comfort Hotel', 'Pune', 'Situated in the vibrant heart of Pune''s premier business district. Offers contemporary luxury, soundproof executive suites, state-of-the-art workstations, and rooftop dining.', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'),
(5, 'Green Valley Stay', 'Lonavala', 'A tranquil nature retreat surrounded by misty hills, lush waterfalls, and private manicured gardens. Perfect for families, couples, and weekend getaways from the bustling city.', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'),
(6, 'Marine Bay Luxury Suites', 'Mumbai', 'A contemporary waterfront boutique hotel located along Marine Drive, Mumbai. Features panoramic skyline vistas, rooftop infinity pool, and fine dining.', 'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80'),
(7, 'Sunset Palms Beach Resort', 'Goa', 'A tranquil beachfront escape set amidst sprawling coconut groves in Candolim, North Goa. Features lagoon-style pools and authentic Goan seafood.', 'https://images.unsplash.com/photo-1580835845971-a393b73bf370?auto=format&fit=crop&w=1200&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name), location=VALUES(location), description=VALUES(description), image_url=VALUES(image_url);

INSERT INTO room_types (id, hotel_id, room_name, price_per_night, total_rooms, amenities) VALUES 
(1, 1, 'Luxury Heritage Suite', 5500.00, 8, 'Free High-Speed Wi-Fi, Sea Facing Balcony, Infinity Pool Access, Spa & Wellness, Complimentary Gourmet Breakfast, 24/7 Butler Service'),
(2, 2, 'Deluxe Beachfront Villa', 4200.00, 6, 'Private Beach Access, Outdoor Swimming Pool, Beachfront Cocktail Bar, Airport Shuttle, Free Breakfast, Watersports Equipment'),
(3, 3, 'Premium Himalayan Chalet', 3800.00, 5, 'Panoramic Snow Peaks View, Cedar Wood Fireplace, Central Heating, In-house Bakery & Cafe, Guided Trekking Tours, Heated Jacuzzi'),
(4, 4, 'Executive Business Suite', 2900.00, 10, 'Ultra Fast Fiber Wi-Fi, Ergonomic Workstation, Conference Facilities, Fitness Center, 24/7 Room Service, Airport Transfer'),
(5, 5, 'Serene Garden Cottage', 3500.00, 4, 'Private Garden Lawn, Swimming Pool with Cabanas, Evening Bonfire & BBQ, Nature Trails, Free Parking, Mountain View Terrace'),
(6, 6, 'Oceanview Deluxe King', 4800.00, 6, 'Free Wi-Fi, Marine Drive Views, Rooftop Lounge, Infinity Pool, Gourmet Breakfast, Fitness Center'),
(7, 7, 'Palm Lagoon Cottage', 3900.00, 7, 'Free Wi-Fi, Lagoon Pool, Beach Access, Ayurvedic Spa, Seafood Restaurant, Bicycle Rental')
ON DUPLICATE KEY UPDATE room_name=VALUES(room_name), price_per_night=VALUES(price_per_night), total_rooms=VALUES(total_rooms), amenities=VALUES(amenities);
