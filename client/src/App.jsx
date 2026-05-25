import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Core routes wrappers
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetails from './pages/EquipmentDetails';
import AddEquipment from './pages/owner/AddEquipment';
import EditEquipment from './pages/owner/EditEquipment';
import MyEquipment from './pages/owner/MyEquipment';
import CreateBooking from './pages/farmer/CreateBooking';
import FarmerBookings from './pages/farmer/FarmerBookings';
import OwnerBookings from './pages/owner/OwnerBookings';
import Reviews from './pages/Reviews';
import Disputes from './pages/Disputes';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/equipment" element={<EquipmentList />} />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />
              <Route path="/reviews" element={<Reviews />} />

              {/* Farmer Protected Routes */}
              <Route
                path="/farmer-dashboard"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['farmer']}>
                      <FarmerDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/create"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['farmer']}>
                      <CreateBooking />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer-bookings"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['farmer']}>
                      <FarmerBookings />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Owner Protected Routes */}
              <Route
                path="/owner-dashboard"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-equipment"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['owner']}>
                      <MyEquipment />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-equipment"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['owner']}>
                      <AddEquipment />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipment/:id/edit"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['owner']}>
                      <EditEquipment />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner-bookings"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['owner']}>
                      <OwnerBookings />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute>
                    <RoleRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  </ProtectedRoute>
                }
              />

              {/* General Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/disputes"
                element={
                  <ProtectedRoute>
                    <Disputes />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
