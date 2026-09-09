const mongoose = require('mongoose');
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const dotenv = require('dotenv');

dotenv.config();

const runTestSeeding = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrirent';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully for test seeding.');

    // 1. Locate the owner and farmer accounts
    const testOwner = await User.findOne({ email: 'hzsp23bcs@gmail.com' });
    const testFarmer = await User.findOne({ email: 'mh7142809@gmail.com' });

    if (!testOwner) {
      console.error('ERROR: Owner user "hzsp23bcs@gmail.com" not found. Please register first.');
      process.exit(1);
    }
    if (!testFarmer) {
      console.error('ERROR: Farmer user "mh7142809@gmail.com" not found. Please register first.');
      process.exit(1);
    }

    console.log(`Found Owner: ${testOwner.name} (${testOwner._id})`);
    console.log(`Found Farmer: ${testFarmer.name} (${testFarmer._id})`);

    // 2. Clear old test-related data for these users to prevent duplication
    const oldEquipmentIds = await Equipment.find({ ownerId: testOwner._id }).distinct('_id');
    
    await Equipment.deleteMany({ ownerId: testOwner._id });
    await Booking.deleteMany({
      $or: [
        { renterId: testFarmer._id },
        { ownerId: testOwner._id }
      ]
    });
    
    await Payment.deleteMany({
      $or: [
        { renterId: testFarmer._id },
        { ownerId: testOwner._id }
      ]
    });

    console.log('Cleaned pre-existing test listings and bookings.');

    // 3. Create realistic Equipment Listings for the owner (hzsp23bcs@gmail.com)
    // Pictures are specific and premium-looking
    const newListings = await Equipment.insertMany([
      {
        ownerId: testOwner._id,
        title: 'Massey Ferguson MF 385 Tractor 4WD',
        description: 'Heavy-duty 85HP engine with 4-wheel drive. Excellent traction, perfect for deep ploughing, land preparation, and heavy haulage.',
        category: 'tractor',
        brand: 'Massey Ferguson',
        model: 'MF 385',
        rentPerDay: 6500,
        securityDeposit: 15000,
        images: ['https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg'],
        location: {
          type: 'Point',
          coordinates: testOwner.location?.coordinates || [73.0125, 30.2917],
          address: testOwner.address || 'Arifwala, Punjab',
          city: 'Arifwala'
        },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: testOwner._id,
        title: 'Kubota DC-70G Combined Harvester Pro',
        description: 'Modern crawler combine harvester. Ideal for harvesting rice/paddy and wheat crops, offers quick speed and minimal grain loss.',
        category: 'harvester',
        brand: 'Kubota',
        model: 'DC-70G',
        rentPerDay: 13500,
        securityDeposit: 30000,
        images: ['https://images.unsplash.com/photo-1595246140625-568b29e0de45?auto=format&fit=crop&w=600&q=80'],
        location: {
          type: 'Point',
          coordinates: testOwner.location?.coordinates || [73.0125, 30.2917],
          address: testOwner.address || 'Arifwala, Punjab',
          city: 'Arifwala'
        },
        status: 'approved',
        isAvailable: true,
      },
      {
        ownerId: testOwner._id,
        title: 'Millat Spring-Tine Cultivator (11 Tine)',
        description: 'Spring loaded 11-tine cultivator designed for soil preparation, weed control, and aeration. Highly durable steel build.',
        category: 'cultivator',
        brand: 'Millat',
        model: 'MC-11',
        rentPerDay: 1800,
        securityDeposit: 3000,
        images: ['https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&w=600&q=80'],
        location: {
          type: 'Point',
          coordinates: testOwner.location?.coordinates || [73.0125, 30.2917],
          address: testOwner.address || 'Arifwala, Punjab',
          city: 'Arifwala'
        },
        status: 'approved',
        isAvailable: true,
      }
    ]);

    console.log('Seeded 3 realistic equipment listings with matching images.');

    const mfTractor = newListings[0];
    const kubotaHarvester = newListings[1];
    const millatCultivator = newListings[2];

    // Find another standard listing in the system to simulate renting from someone else
    const externalTractor = await Equipment.findOne({ ownerId: { $ne: testOwner._id }, status: 'approved' });

    // 4. Create Bookings to populate dashboards
    // Booking 1: Pending Request (Renter mh7142809 requests Owner's MF 385 Tractor)
    const pendingStart = new Date();
    pendingStart.setDate(pendingStart.getDate() + 2);
    const pendingEnd = new Date();
    pendingEnd.setDate(pendingEnd.getDate() + 5);

    // Booking 2: Active Session (Renter mh7142809 currently renting Owner's Kubota Harvester)
    const activeStart = new Date();
    activeStart.setDate(activeStart.getDate() - 2);
    const activeEnd = new Date();
    activeEnd.setDate(activeEnd.getDate() + 3);

    // Booking 3: Approved Future Booking (Renter mh7142809 approved for Owner's Millat Cultivator)
    const approvedStart = new Date();
    approvedStart.setDate(approvedStart.getDate() + 6);
    const approvedEnd = new Date();
    approvedEnd.setDate(approvedEnd.getDate() + 8);

    // Booking 4: Completed Booking (Renter mh7142809 previously rented some external equipment)
    const completedStart = new Date();
    completedStart.setDate(completedStart.getDate() - 12);
    const completedEnd = new Date();
    completedEnd.setDate(completedEnd.getDate() - 9);

    const testBookings = await Booking.insertMany([
      {
        equipmentId: mfTractor._id,
        renterId: testFarmer._id,
        ownerId: testOwner._id,
        startDate: pendingStart,
        endDate: pendingEnd,
        totalDays: 3,
        rentPerDay: mfTractor.rentPerDay,
        totalAmount: mfTractor.rentPerDay * 3,
        pickupAddress: mfTractor.location.address,
        purpose: 'Preparing fields for sowing potatoes.',
        status: 'pending',
      },
      {
        equipmentId: kubotaHarvester._id,
        renterId: testFarmer._id,
        ownerId: testOwner._id,
        startDate: activeStart,
        endDate: activeEnd,
        totalDays: 5,
        rentPerDay: kubotaHarvester.rentPerDay,
        totalAmount: kubotaHarvester.rentPerDay * 5,
        pickupAddress: kubotaHarvester.location.address,
        purpose: 'Harvesting Basmati rice fields.',
        status: 'active',
      },
      {
        equipmentId: millatCultivator._id,
        renterId: testFarmer._id,
        ownerId: testOwner._id,
        startDate: approvedStart,
        endDate: approvedEnd,
        totalDays: 2,
        rentPerDay: millatCultivator.rentPerDay,
        totalAmount: millatCultivator.rentPerDay * 2,
        pickupAddress: millatCultivator.location.address,
        purpose: 'Tilling and mixing fertilizer in the fields.',
        status: 'approved',
      },
      ...(externalTractor ? [{
        equipmentId: externalTractor._id,
        renterId: testFarmer._id,
        ownerId: externalTractor.ownerId,
        startDate: completedStart,
        endDate: completedEnd,
        totalDays: 3,
        rentPerDay: externalTractor.rentPerDay,
        totalAmount: externalTractor.rentPerDay * 3,
        pickupAddress: externalTractor.location.address,
        purpose: 'General crop field transportation and watering.',
        status: 'completed',
      }] : [])
    ]);

    console.log('Seeded bookings representing various dashboard states.');

    // 5. Seed Payments for active and completed runs
    const payments = [];
    
    // Payment for active harvester
    payments.push({
      bookingId: testBookings[1]._id,
      renterId: testFarmer._id,
      ownerId: testOwner._id,
      amount: testBookings[1].totalAmount,
      method: 'easypaisa',
      paymentStatus: 'paid',
      transactionId: 'EP-7721830219',
      paidAt: new Date(activeStart.getTime() + 12 * 60 * 60 * 1000)
    });

    // Payment for completed external rental
    if (testBookings[3]) {
      payments.push({
        bookingId: testBookings[3]._id,
        renterId: testFarmer._id,
        ownerId: externalTractor.ownerId,
        amount: testBookings[3].totalAmount,
        method: 'easypaisa',
        paymentStatus: 'paid',
        transactionId: 'EP-4412984920',
        paidAt: completedEnd
      });
    }

    await Payment.insertMany(payments);
    console.log('Seeded Payments.');

    // 6. Seed Notifications to alert dashboard users
    await Notification.insertMany([
      {
        userId: testOwner._id,
        title: 'New Booking Request',
        message: `${testFarmer.name} has requested to book your ${mfTractor.title}.`,
        type: 'booking_request',
        relatedEntityId: testBookings[0]._id,
        isRead: false,
      },
      {
        userId: testFarmer._id,
        title: 'Booking Approved',
        message: `Your booking request for ${millatCultivator.title} has been approved!`,
        type: 'booking_approved',
        relatedEntityId: testBookings[2]._id,
        isRead: false,
      }
    ]);

    console.log('Seeded dashboard Notifications.');
    console.log('Test seeding process complete! Both dashboards populated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

runTestSeeding();
