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

// Quick Seed Route to initialize essential categories and admin account in production
app.get('/api/seed', async (req, res) => {
  try {
    const Category = require('./models/Category');
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    let seededCategories = 0;
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
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
      seededCategories = categoriesData.length;
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

    res.json({
      success: true,
      message: 'Database initial data verified.',
      seededCategories,
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

