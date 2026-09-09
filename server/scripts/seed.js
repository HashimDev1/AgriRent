const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Models
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Category = require('../models/Category');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirent');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany();
    await Equipment.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Dispute.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    await Category.deleteMany();
    console.log('Cleaned existing collections.');

    // Seed default categories
    const categoriesData = [
      { value: 'tractor', label: 'Tractor', subtitle: 'Land preparation', icon: '🚜', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg' },
      { value: 'harvester', label: 'Harvester', subtitle: 'Crop harvesting', icon: '🌾', img: 'https://images.unsplash.com/photo-1595246140625-568b29e0de45?auto=format&fit=crop&w=300&q=80' },
      { value: 'seed_drill', label: 'Seed Drill', subtitle: 'Precision sowing', icon: '🌱', img: 'https://images.unsplash.com/photo-1605000797499-95a51c7769ae?auto=format&fit=crop&w=300&q=80' },
      { value: 'sprayer', label: 'Sprayer', subtitle: 'Crop spraying', icon: '💧', img: 'https://images.unsplash.com/photo-1563514223725-41d19b15f40c?auto=format&fit=crop&w=300&q=80' },
      { value: 'water_pump', label: 'Water Pump', subtitle: 'Irrigation support', icon: '🚿', img: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=300&q=80' },
      { value: 'cultivator', label: 'Cultivator', subtitle: 'Soil aeration', icon: '⚙️', img: 'https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&w=300&q=80' },
      { value: 'plough', label: 'Plough', subtitle: 'Deep tilling', icon: '🛠️', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=300&q=80' },
      { value: 'other', label: 'Other Attachments', subtitle: 'General maintenance', icon: '⚙️', img: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?auto=format&fit=crop&w=300&q=80' },
    ];
    await Category.insertMany(categoriesData);
    console.log('Seeded Categories.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    const users = await User.insertMany([
      {
        name: 'System Administrator',
        email: 'admin@agrirent.com',
        passwordHash: adminPasswordHash,
        phone: '03450001122',
        role: 'admin',
        isVerified: true,
        address: 'Headquarters, Islamabad',
        location: { type: 'Point', coordinates: [73.0479, 33.6844] },
      },
      {
        name: 'Ali Khan',
        email: 'owner1@agrirent.com',
        passwordHash,
        phone: '03001234567',
        role: 'owner',
        isVerified: true,
        address: 'Near Main Bazaar, Sargodha',
        cnicNumber: '35202-1234567-1',
        location: { type: 'Point', coordinates: [72.6711, 32.0836] },
      },
      {
        name: 'Sajid Mahmood',
        email: 'owner2@agrirent.com',
        passwordHash,
        phone: '03119876543',
        role: 'owner',
        isVerified: true,
        address: 'Multan Road, Sahiwal',
        cnicNumber: '34101-7654321-2',
        location: { type: 'Point', coordinates: [73.1022, 30.6622] },
      },
      {
        name: 'Muhammad Hashim',
        email: 'farmer1@agrirent.com',
        passwordHash,
        phone: '03214567890',
        role: 'farmer',
        isVerified: true,
        address: 'Village 123-EB, Arifwala',
        cnicNumber: '35404-5432109-3',
        location: { type: 'Point', coordinates: [73.0125, 30.2917] },
      },
      {
        name: 'Tariq Jameel',
        email: 'farmer2@agrirent.com',
        passwordHash,
        phone: '03335557777',
        role: 'farmer',
        isVerified: false,
        address: 'Daska Road, Sialkot',
        cnicNumber: '35102-1112223-3',
        location: { type: 'Point', coordinates: [74.5222, 32.4922] },
      },
    ]);

    const adminUser = users[0];
    const owner1 = users[1];
    const owner2 = users[2];
    const farmer1 = users[3];
    const farmer2 = users[4];

    console.log('Seeded Users.');

    // 2. Create Equipment
    const equipments = await Equipment.insertMany([
      {
        ownerId: owner1._id,
        title: 'John Deere 5050D Tractor',
        description: 'High power fuel efficient tractor suitable for tilling, ploughing and heavy haulage. Comes with double clutch and power steering.',
        category: 'tractor',
        brand: 'John Deere',
        model: '5050D',
        rentPerDay: 5000,
        securityDeposit: 10000,
        images: ['https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg'],
        location: { type: 'Point', coordinates: [72.6711, 32.0836], address: 'Main Bazaar Road', city: 'Sargodha' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner1._id,
        title: 'Kubota DC-70G Combined Harvester',
        description: 'Excellent rice/paddy and wheat combine harvester. Heavy output speed with minimum grain wastage.',
        category: 'harvester',
        brand: 'Kubota',
        model: 'DC-70G',
        rentPerDay: 12000,
        securityDeposit: 25000,
        images: ['https://images.unsplash.com/photo-1595246140625-568b29e0de45?auto=format&fit=crop&w=600&q=80'],
        location: { type: 'Point', coordinates: [72.6711, 32.0836], address: 'Main Bazaar Road', city: 'Sargodha' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner1._id,
        title: 'Precision Sowing Seed Drill 9-Row',
        description: 'Highly effective seed drill for wheat, canola, and soy. Adjusts depth and seed count per meter.',
        category: 'seed_drill',
        brand: 'Millat',
        model: 'SD-900',
        rentPerDay: 3500,
        securityDeposit: 5000,
        images: ['https://images.unsplash.com/photo-1605000797499-95a51c7769ae?auto=format&fit=crop&w=600&q=80'],
        location: { type: 'Point', coordinates: [72.6711, 32.0836], address: 'Main Bazaar Road', city: 'Sargodha' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner1._id,
        title: 'Tractor Mounted Boom Sprayer 500L',
        description: 'Large chemical tank sprayer with 30-foot wingspan. Ideal for pesticide application on crops.',
        category: 'sprayer',
        brand: 'Fiat',
        model: 'BS-500',
        rentPerDay: 2000,
        securityDeposit: 3000,
        images: ['https://images.unsplash.com/photo-1563514223725-41d19b15f40c?auto=format&fit=crop&w=600&q=80'],
        location: { type: 'Point', coordinates: [72.6711, 32.0836], address: 'Main Bazaar Road', city: 'Sargodha' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'pending_verification',
        isAvailable: true,
      },
      {
        ownerId: owner2._id,
        title: 'Diesel Water Pump 4-Inch Discharge',
        description: 'High pressure diesel water pump for heavy irrigation. Discharges up to 800 liters per minute.',
        category: 'water_pump',
        brand: 'Peter',
        model: 'DP-4',
        rentPerDay: 1500,
        securityDeposit: 2000,
        images: ['https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80'],
        location: { type: 'Point', coordinates: [73.1022, 30.6622], address: 'Multan Road Bypass', city: 'Sahiwal' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner2._id,
        title: 'Heavy Duty Cultivator 11-Tine',
        description: 'Aerates soil and clears crop residue. High-grade spring steel tines.',
        category: 'cultivator',
        brand: 'Millat',
        model: 'MC-11',
        rentPerDay: 1800,
        securityDeposit: 2500,
        images: ['https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&w=600&q=80'],
        location: { type: 'Point', coordinates: [73.1022, 30.6622], address: 'Multan Road Bypass', city: 'Sahiwal' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner2._id,
        title: 'M.B. Plough 3-Bottom',
        description: 'Mouldboard plough for deep tillage. Perfect for rocky or trashy fields.',
        category: 'plough',
        brand: 'Lasani',
        model: 'DP-3',
        rentPerDay: 2200,
        securityDeposit: 4000,
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'],
        location: { type: 'Point', coordinates: [73.1022, 30.6622], address: 'Multan Road Bypass', city: 'Sahiwal' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: owner2._id,
        title: 'Rotary Tiller / Rotavator 6-Feet',
        description: 'Tilling rotavator for preparing fields. Turns soil and chops vegetation.',
        category: 'other',
        brand: 'Fiat',
        model: 'RT-180',
        rentPerDay: 3000,
        securityDeposit: 5000,
        images: ['https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80'],
        location: { type: 'Point', coordinates: [73.1022, 30.6622], address: 'Multan Road Bypass', city: 'Sahiwal' },
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
        status: 'pending_verification',
        isAvailable: true,
      },
    ]);

    console.log('Seeded Equipment.');

    // 3. Create Bookings & Payments
    // Booking 1: completed, Ali Khan's tractor by Hashim. Completed 10 days ago to 7 days ago.
    const start1 = new Date();
    start1.setDate(start1.getDate() - 10);
    const end1 = new Date();
    end1.setDate(end1.getDate() - 7);

    // Booking 2: completed, Sajid's water pump by Hashim. Completed 8 days ago to 5 days ago.
    const start2 = new Date();
    start2.setDate(start2.getDate() - 8);
    const end2 = new Date();
    end2.setDate(end2.getDate() - 5);

    // Booking 3: active, Ali Khan's harvester by Tariq. Active from 3 days ago to 3 days from now.
    const start3 = new Date();
    start3.setDate(start3.getDate() - 3);
    const end3 = new Date();
    end3.setDate(end3.getDate() + 3);

    // Booking 4: approved, Ali Khan's seed drill by Hashim. Approved for tomorrow to 3 days from now.
    const start4 = new Date();
    start4.setDate(start4.getDate() + 1);
    const end4 = new Date();
    end4.setDate(end4.getDate() + 3);

    // Booking 5: pending, Sajid's cultivator by Tariq. Pending for 5 days from now to 7 days from now.
    const start5 = new Date();
    start5.setDate(start5.getDate() + 5);
    const end5 = new Date();
    end5.setDate(end5.getDate() + 7);

    // Booking 6: completed, Sajid's plough by Tariq. Completed 12 days ago to 10 days ago.
    const start6 = new Date();
    start6.setDate(start6.getDate() - 12);
    const end6 = new Date();
    end6.setDate(end6.getDate() - 10);

    const bookings = await Booking.insertMany([
      {
        equipmentId: equipments[0]._id, // tractor
        renterId: farmer1._id,
        ownerId: owner1._id,
        startDate: start1,
        endDate: end1,
        totalDays: 3,
        rentPerDay: 5000,
        totalAmount: 15000,
        pickupAddress: 'Sargodha Depot',
        purpose: 'Tilling fields for wheat sowing.',
        status: 'completed',
      },
      {
        equipmentId: equipments[4]._id, // water pump
        renterId: farmer1._id,
        ownerId: owner2._id,
        startDate: start2,
        endDate: end2,
        totalDays: 3,
        rentPerDay: 1500,
        totalAmount: 4500,
        pickupAddress: 'Sahiwal Yard',
        purpose: 'Irrigating crop fields.',
        status: 'completed',
      },
      {
        equipmentId: equipments[1]._id, // harvester
        renterId: farmer2._id,
        ownerId: owner1._id,
        startDate: start3,
        endDate: end3,
        totalDays: 6,
        rentPerDay: 12000,
        totalAmount: 72000,
        pickupAddress: 'Sargodha Depot',
        purpose: 'Wheat harvesting season crop cutting.',
        status: 'active',
      },
      {
        equipmentId: equipments[2]._id, // seed drill
        renterId: farmer1._id,
        ownerId: owner1._id,
        startDate: start4,
        endDate: end4,
        totalDays: 2,
        rentPerDay: 3500,
        totalAmount: 7000,
        pickupAddress: 'Sargodha Depot',
        purpose: 'Sowing canola seeds.',
        status: 'approved',
      },
      {
        equipmentId: equipments[5]._id, // cultivator
        renterId: farmer2._id,
        ownerId: owner2._id,
        startDate: start5,
        endDate: end5,
        totalDays: 2,
        rentPerDay: 1800,
        totalAmount: 3600,
        pickupAddress: 'Sahiwal Yard',
        purpose: 'Aerating soil.',
        status: 'pending',
      },
      {
        equipmentId: equipments[6]._id, // plough
        renterId: farmer2._id,
        ownerId: owner2._id,
        startDate: start6,
        endDate: end6,
        totalDays: 2,
        rentPerDay: 2200,
        totalAmount: 4400,
        pickupAddress: 'Sahiwal Yard',
        purpose: 'Deep ploughing soil layers.',
        status: 'completed',
      },
    ]);

    console.log('Seeded Bookings.');

    // 4. Create Payments
    await Payment.insertMany([
      {
        bookingId: bookings[0]._id,
        renterId: farmer1._id,
        ownerId: owner1._id,
        amount: 15000,
        method: 'easypaisa',
        paymentStatus: 'paid',
        transactionId: 'EP-98213890',
        paidAt: end1,
      },
      {
        bookingId: bookings[1]._id,
        renterId: farmer1._id,
        ownerId: owner2._id,
        amount: 4500,
        method: 'cash',
        paymentStatus: 'paid',
        paidAt: end2,
      },
      {
        bookingId: bookings[2]._id,
        renterId: farmer2._id,
        ownerId: owner1._id,
        amount: 72000,
        method: 'bank_transfer',
        paymentStatus: 'pending',
      },
      {
        bookingId: bookings[3]._id,
        renterId: farmer1._id,
        ownerId: owner1._id,
        amount: 7000,
        method: 'easypaisa',
        paymentStatus: 'pending',
      },
      {
        bookingId: bookings[4]._id,
        renterId: farmer2._id,
        ownerId: owner2._id,
        amount: 3600,
        method: 'cash',
        paymentStatus: 'pending',
      },
      {
        bookingId: bookings[5]._id,
        renterId: farmer2._id,
        ownerId: owner2._id,
        amount: 4400,
        method: 'card',
        paymentStatus: 'paid',
        transactionId: 'TXN-9023190',
        paidAt: end6,
      },
    ]);

    console.log('Seeded Payments.');

    // 5. Create Reviews
    const reviews = [
      {
        bookingId: bookings[0]._id,
        equipmentId: equipments[0]._id,
        reviewerId: farmer1._id,
        ownerId: owner1._id,
        rating: 5,
        comment: 'The tractor was in perfect condition and Ali Khan was very helpful and responsive.',
      },
      {
        bookingId: bookings[1]._id,
        equipmentId: equipments[4]._id,
        reviewerId: farmer1._id,
        ownerId: owner2._id,
        rating: 4,
        comment: 'Good discharge water pump. Worked perfectly for our rice field irrigation. Heavy fuel usage, but got the job done.',
      },
      {
        bookingId: bookings[5]._id,
        equipmentId: equipments[6]._id,
        reviewerId: farmer2._id,
        ownerId: owner2._id,
        rating: 5,
        comment: 'Very heavy duty plough, did the job quickly. Clean transaction.',
      },
    ];

    for (const rev of reviews) {
      const reviewObj = new Review(rev);
      await reviewObj.save(); // Using save to trigger the post-save hooks recalculating equipment rating
    }

    console.log('Seeded Reviews & recalculated equipment ratings.');

    // 6. Create Disputes
    await Dispute.insertMany([
      {
        bookingId: bookings[2]._id, // Harvester (active)
        equipmentId: equipments[1]._id,
        createdBy: owner1._id, // Owner Ali Khan disputes
        againstUserId: farmer2._id, // against renter Tariq Jameel
        reason: 'equipment_damage',
        description: 'Tariq Jameel hit a concrete pipe which cracked the cutting teeth on the harvester. Repair cost is significant.',
        evidenceImages: ['https://images.unsplash.com/photo-1595246140625-568b29e0de45?auto=format&fit=crop&w=600&q=80'],
        status: 'open',
      },
      {
        bookingId: bookings[1]._id, // Water pump (completed)
        equipmentId: equipments[4]._id,
        createdBy: farmer1._id, // Farmer Hashim disputes
        againstUserId: owner2._id, // against owner Sajid
        reason: 'wrong_information',
        description: 'The diesel pump fuel tank had a small crack causing continuous fuel leak. Refused to reimburse fuel cost.',
        status: 'under_review',
        adminRemarks: 'Looking into fuel consumption records.',
      },
    ]);

    console.log('Seeded Disputes.');

    // 7. Seed Notifications
    await Notification.insertMany([
      {
        userId: owner1._id,
        title: 'New Booking Request',
        message: 'Muhammad Hashim has requested to book your John Deere 5050D Tractor.',
        type: 'booking_request',
        relatedEntityId: bookings[3]._id,
        isRead: false,
      },
      {
        userId: farmer1._id,
        title: 'Booking Approved',
        message: 'Your booking request for Precision Sowing Seed Drill 9-Row has been approved!',
        type: 'booking_approved',
        relatedEntityId: bookings[3]._id,
        isRead: true,
      },
    ]);

    console.log('Seeded Notifications.');
    console.log('Database Seeding Completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
