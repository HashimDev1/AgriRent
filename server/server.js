const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/', (req, res) => {
  res.send('AgriRent API is running...');
});

// Bind Routes
app.use('/api/auth', require('./routes/shared/authRoutes'));
app.use('/api/users', require('./routes/shared/userRoutes'));
app.use('/api/notifications', require('./routes/shared/notificationRoutes'));
app.use('/api/admin', require('./routes/admin/adminRoutes'));

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

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
