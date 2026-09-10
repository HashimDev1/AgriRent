const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware - Flexible CORS for development & production (Render domains, local, custom)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server, or same-origin)
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV !== 'production' || process.env.CLIENT_URL === '*') {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.includes('localhost')
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route (Used by Render to verify deployment status)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'AgriRent API', timestamp: new Date() });
});

// Quick Seed Route to initialize or update essential categories and admin account in production
app.get('/api/seed', async (req, res) => {
  try {
    const Category = require('./models/Category');
    const User = require('./models/User');
    const Equipment = require('./models/Equipment');
    const bcrypt = require('bcryptjs');

    const categoriesData = [
      { value: 'tractor', label: 'Tractor', subtitle: 'Land preparation', icon: '🚜', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg' },
      { value: 'harvester', label: 'Harvester', subtitle: 'Crop harvesting', icon: '🌾', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212834/agrirent/categories/lprumcwgvxluih9izhvh.jpg' },
      { value: 'seed_drill', label: 'Seed Drill', subtitle: 'Precision sowing', icon: '🌱', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212920/agrirent/categories/bphxixyjloaxop2d5g3l.jpg' },
      { value: 'sprayer', label: 'Sprayer', subtitle: 'Crop spraying', icon: '💧', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212891/agrirent/categories/dk7b0vvl1fepem7p0wmz.jpg' },
      { value: 'water_pump', label: 'Water Pump', subtitle: 'Irrigation support', icon: '🚿', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781214249/agrirent/categories/pugxszbdu1talbrdjqf5.jpg' },
      { value: 'cultivator', label: 'Cultivator', subtitle: 'Soil aeration', icon: '⚙️', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212800/agrirent/categories/culylyvws4h2swvf8mmn.jpg' },
      { value: 'plough', label: 'Plough', subtitle: 'Deep tilling', icon: '🛠️', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781214209/agrirent/categories/fhho7ays9quvvsbmnjfg.jpg' },
      { value: 'other', label: 'Other Attachments', subtitle: 'General maintenance', icon: '⚙️', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781214112/agrirent/equipment/i5ljph4awtdsx3ppdci8.jpg' },
    ];

    // Upsert each category with verified Cloudinary image
    for (const cat of categoriesData) {
      await Category.findOneAndUpdate(
        { value: cat.value },
        { $set: { label: cat.label, subtitle: cat.subtitle, icon: cat.icon, img: cat.img } },
        { upsert: true, new: true }
      );
    }

    let adminStatus = 'already exists';
    const adminExists = await User.findOne({ email: 'admin@agrirent.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await User.create({
        name: 'System Administrator',
        email: 'admin@agrirent.com',
        passwordHash,
        phone: '03450001122',
        role: 'admin',
        isVerified: true,
        address: 'Islamabad, Pakistan',
        location: { type: 'Point', coordinates: [73.0479, 33.6844] },
      });
      adminStatus = 'created (admin@agrirent.com / admin123)';
    }

    // Update equipment listings to use authentic Cloudinary photos
    await Equipment.updateMany(
      { category: 'tractor' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg'] }
    );
    await Equipment.updateMany(
      { category: 'harvester' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781213127/agrirent/equipment/kluhscvibk8ox0kflrox.jpg'] }
    );
    await Equipment.updateMany(
      { category: 'seed_drill' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781213242/agrirent/equipment/qkpoir3bhtpwv4txpzfk.jpg'] }
    );
    await Equipment.updateMany(
      { category: 'sprayer' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781213105/agrirent/equipment/kucspae23hdcy3ik7h66.jpg'] }
    );
    await Equipment.updateMany(
      { category: 'water_pump' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781213594/agrirent/equipment/drk4enx7jtqr1jehlntv.jpg'] }
    );
    await Equipment.updateMany(
      { category: 'cultivator' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781213972/agrirent/equipment/mljw0cv3bi4yaqj2wczq.jpg'] }
    );
    await Equipment.updateMany(
      { category: 'plough' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781214084/agrirent/equipment/h8ajkf6701z5sfaizbel.jpg'] }
    );
    await Equipment.updateMany(
      { category: 'other' },
      { $set: { images: ['https://res.cloudinary.com/hashim055/image/upload/v1781214112/agrirent/equipment/i5ljph4awtdsx3ppdci8.jpg'] }
    );

    res.json({
      success: true,
      message: 'All categories and equipment updated with authentic Cloudinary URLs!',
      categoriesCount: categoriesData.length,
      adminAccount: adminStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bind API Routes
app.use('/api/auth', require('./routes/shared/authRoutes'));
app.use('/api/users', require('./routes/shared/userRoutes'));
app.use('/api/notifications', require('./routes/shared/notificationRoutes'));
app.use('/api/admin', require('./routes/admin/adminRoutes'));
app.use('/api/categories', require('./routes/shared/categoryRoutes'));

// Bookings Routing (split by roles)
app.use('/api/bookings', require('./routes/farmer/bookingRoutes'));
app.use('/api/bookings', require('./routes/owner/bookingRoutes'));
app.use('/api/bookings', require('./routes/shared/bookingRoutes'));

// Equipment Routing
app.use('/api/equipment', require('./routes/owner/equipmentRoutes'));
app.use('/api/equipment', require('./routes/shared/equipmentRoutes'));

// Payments Routing
app.use('/api/payments', require('./routes/farmer/paymentRoutes'));
app.use('/api/payments', require('./routes/owner/paymentRoutes'));
app.use('/api/payments', require('./routes/shared/paymentRoutes'));

// Disputes Routing
app.use('/api/disputes', require('./routes/admin/disputeRoutes'));
app.use('/api/disputes', require('./routes/shared/disputeRoutes'));

// Reviews Routing
app.use('/api/reviews', require('./routes/farmer/reviewRoutes'));
app.use('/api/reviews', require('./routes/shared/reviewRoutes'));

// Serve frontend static assets in production if client build exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for React Router
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Welcome route if frontend is deployed separately
  app.get('/', (req, res) => {
    res.send('AgriRent API is running...');
  });
}

// Fallback Middlewares for unhandled API routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

