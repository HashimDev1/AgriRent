# AgriRent - Farm Machinery Rental Platform

AgriRent is a full-stack MERN stack Single Page Application (SPA) designed to help small-scale farmers rent agricultural machinery (tractors, harvesters, seed drills, water pumps, etc.) from nearby equipment owners at transparent rates with booking management, verification workflows, and dispute logs.

---

## 🌾 Main Features
1. **Authentication & Authorization**: Role-based access for Farmers, Owners, and Admins. CNIC identification field and JWT token storage.
2. **Equipment Catalogue**: Owners can list machinery with photos, daily rent rates, security deposit, address coordinates, and availability calendars.
3. **Advanced Geospatial Search**: Farmers can filter by category, city, daily price, rating, keyword, and proximity (geospatial coordinates search).
4. **Booking Lifecycle Manager**: Includes scheduling overlap checks, status badges, owner approval/rejection triggers, pickup activations, and returns completion.
5. **Invoice Payments**: Easy logging of easypaisa, jazzcash, and bank transfer payments.
6. **Reviews & Ratings**: Aggregated star ratings automatically update listing scores via Mongoose database hooks.
7. **Dispute Resolution Console**: Renter and Owner damage claim reports with Admin verification and resolution workflows.
8. **System Notification Alerts**: Dynamic unread notification indicators in the navigation bar.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, React Router DOM v6, Tailwind CSS, Axios client API, React Context API.
- **Backend**: Node.js, Express.js, JWT, Bcrypt.js, CORS.
- **Database**: MongoDB, Mongoose schemas with 2dsphere index bindings for GPS location queries.

---

## 📂 Codebase Structure by Role

To make development and updates easier to track, the codebase is strictly separated into role-specific folders (`admin`, `farmer`, `owner`, and `shared`) on both the frontend and backend.

### 1. Frontend Pages (`client/src/pages/`)
* **`admin/`**: Components for system administrators (e.g. `AdminDashboard.jsx`).
* **`farmer/`**: Pages for the farmer/renter (e.g. `FarmerDashboard.jsx`, `FarmerBookings.jsx`, `CreateBooking.jsx`).
* **`owner/`**: Pages for the equipment owner (e.g. `OwnerDashboard.jsx`, `OwnerBookings.jsx`, `MyEquipment.jsx`, `AddEquipment.jsx`, `EditEquipment.jsx`).
* **Shared / Public Pages**: Located at the root of the `pages/` directory (e.g. `Home.jsx`, `Login.jsx`, `Register.jsx`, `Disputes.jsx`, `Notifications.jsx`, `Profile.jsx`, `EquipmentList.jsx`, `EquipmentDetails.jsx`, `Reviews.jsx`, `NotFound.jsx`).

### 2. Backend Architecture (`server/`)
The routing and controller layers are modularized by actor roles to isolate business logic:
* **Controllers (`server/controllers/`)**:
  * `admin/` ➡️ Dispute resolutions and admin dashboard reports.
  * `farmer/` ➡️ Sowing/harvesting bookings, renter cancellations, renter payments, and reviews.
  * `owner/` ➡️ Equipment listings management, booking approvals, rentals activation, and payouts/receivables.
  * `shared/` ➡️ Auth logins, registration, notifications, user profiles, and public listings browsing.
* **Routes (`server/routes/`)**:
  * Replicated into `admin/`, `farmer/`, `owner/`, and `shared/` subdirectories to handle endpoint routing for each corresponding controller action.

---

## 👥 Roles & Actor Credentials

### 1. Farmer / Renter
- Registers, browses catalog with distance metrics, submits booking requests, uploads payment slips, writes reviews, and registers disputes.
- **Demo login**: `farmer1@agrirent.com` / `password123`

### 2. Equipment Owner
- Lists heavy machinery, approves/rejects requests, activates pickup status, marks returns completed, and reviews earnings metrics.
- **Demo login**: `owner1@agrirent.com` / `password123`

### 3. Administrator
- Verifies users/listings, blocks/unblocks profiles, and resolves/rejects disputes.
- **Demo login**: `admin@agrirent.com` / `admin123`

---

## 📋 REST API Endpoints Summary

### Auth
- `POST /api/auth/register` - Create farmer or owner account
- `POST /api/auth/login` - Verify credentials and return JWT
- `GET /api/auth/me` - Fetch logged-in user profile

### Equipment
- `POST /api/equipment` - List machinery (Owner only)
- `GET /api/equipment` - List approved listings (Public)
- `GET /api/equipment/search` - Geospatial/categorical filter queries
- `GET /api/equipment/:id` - Details page view
- `PUT /api/equipment/:id` - Edit listing
- `DELETE /api/equipment/:id` - Delete listing

### Bookings
- `POST /api/bookings` - Submit booking request (Farmer only)
- `GET /api/bookings/farmer` - Farmer booking history list
- `GET /api/bookings/owner` - Owner booking requests list
- `PUT /api/bookings/:id/approve` - Approve booking (Owner only)
- `PUT /api/bookings/:id/reject` - Reject booking (Owner only)
- `PUT /api/bookings/:id/cancel` - Cancel booking (Farmer only)
- `PUT /api/bookings/:id/active` - Activate pickup (Owner only)
- `PUT /api/bookings/:id/complete` - Complete rental return (Owner only)

### Disputes
- `POST /api/disputes` - Submit dispute claims
- `GET /api/disputes/my` - User active disputes
- `PUT /api/disputes/:id/status` - Update dispute state (Admin only)

### Admin Operations
- `GET /api/admin/dashboard` - Get metrics and revenue charts
- `GET /api/admin/users` - View system user profiles
- `PUT /api/admin/users/:id/verify` - Verify user documents
- `PUT /api/admin/users/:id/block` - Toggle profile blocks

---

## 🚀 Deploying to Render

AgriRent is pre-configured to deploy on [Render](https://render.com) smoothly. You have two options:

### 🌟 Option 1: Single Unified Web Service (Recommended)
This deploys both the Node/Express backend and the React frontend in a single Render Web Service, fitting nicely within Render's free tier without CORS issues.

1. **Push your code to GitHub** (make sure your repo is public or accessible to Render).
2. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New +** ➡️ **Web Service**.
3. Connect your GitHub repository `HashimDev1/AgriRent`.
4. Configure the service settings:
   - **Name**: `agrirent` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose the closest region (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty / root)*
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://<username>:<password>@cluster0.mongodb.net/agrirent?retryWrites=true&w=majority` *(Your MongoDB Atlas URI)*
   - `JWT_SECRET` = *(Any random secure string, e.g. `agrirent_super_secure_key_2026`)*
   - `CLOUDINARY_CLOUD_NAME` = *(Your Cloudinary cloud name, or leave blank to use mock image fallbacks)*
   - `CLOUDINARY_API_KEY` = *(Your Cloudinary API key)*
   - `CLOUDINARY_API_SECRET` = *(Your Cloudinary API secret)*
6. Click **Create Web Service**.
7. Once Render finishes building and deploying, click the public URL (e.g. `https://agrirent.onrender.com`). Your application is live!

---

### ⚡ Option 2: Render Blueprint (`render.yaml`)
If you prefer 1-click infrastructure as code:
1. In Render Dashboard, click **New +** ➡️ **Blueprint**.
2. Select your `AgriRent` repository.
3. Render reads `render.yaml` automatically and prompts you for the missing environment variables (`MONGO_URI`, Cloudinary keys).
4. Click **Apply**.

---

### 🌾 Seeding Demo Data on Production (Optional)
To seed initial categories, admin account, equipment listings, and demo users into your MongoDB Atlas database:
1. Locally or in Render's Shell tab, run:
   ```bash
   MONGO_URI="your_mongodb_atlas_connection_string" npm run seed
   ```
2. You can then log in with:
   - **Admin**: `admin@agrirent.com` / `admin123`
   - **Owner**: `owner1@agrirent.com` / `password123`
   - **Farmer**: `farmer1@agrirent.com` / `password123`

---

## 📷 Screenshots Placeholders
*Screenshots can be added under `/client/public/screenshots/` to demonstrate home screen, dashboards, and booking modals.*

---

*Note: This project is submitted for the Advanced Web Technologies MERN Stack Lab Terminal evaluation.*


