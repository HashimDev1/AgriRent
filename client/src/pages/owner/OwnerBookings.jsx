import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import BookingCard from '../../components/BookingCard';
import MobileBackButton from '../../components/MobileBackButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookingsAndPayments = async () => {
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        API.get('/bookings/owner'),
        API.get('/payments/owner'),
      ]);
      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error('Failed to load owner bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndPayments();
  }, []);

  const handleApprove = async (id) => {
    try {
      await API.put(`/bookings/${id}/approve`);
      alert('Booking request approved!');
      fetchBookingsAndPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking request.');
    }
  };

  const handleReject = async (id, message) => {
    try {
      await API.put(`/bookings/${id}/reject`, { message });
      alert('Booking request rejected.');
      fetchBookingsAndPayments();
    } catch (err) {
      alert('Failed to reject booking request.');
    }
  };

  const handleActive = async (id) => {
    try {
      await API.put(`/bookings/${id}/active`);
      alert('Rental session marked active! Farmer has picked up the equipment.');
      fetchBookingsAndPayments();
    } catch (err) {
      alert('Failed to activate booking.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await API.put(`/bookings/${id}/complete`);
      alert('Rental session marked completed! Equipment has been safely returned.');
      fetchBookingsAndPayments();
    } catch (err) {
      alert('Failed to complete booking.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role="owner" />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        <MobileBackButton />
        
        {/* Title */}
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Incoming Rental Requests 📅</h2>
          <p className="text-gray-500 text-sm mt-1">
            Review incoming requests, verify renter details, and trigger statuses.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-150 p-8 space-y-4">
            <span className="text-5xl block">🚜</span>
            <h3 className="font-extrabold text-gray-700 text-lg">No Booking Requests</h3>
            <p className="text-gray-450 text-xs max-w-xs mx-auto">
              Your equipment listings haven't received any booking requests yet. Listings require approval by admin to go public.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              // Find matching payment record
              const matchingPayment = payments.find((p) => p.bookingId?._id === booking._id);

              return (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  payment={matchingPayment}
                  role="owner"
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onActive={handleActive}
                  onComplete={handleComplete}
                />
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default OwnerBookings;
