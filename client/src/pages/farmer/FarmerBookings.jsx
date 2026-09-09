import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import BookingCard from '../../components/BookingCard';
import MobileBackButton from '../../components/MobileBackButton';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const FarmerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals visibility toggles
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);
  const [disputeReason, setDisputeReason] = useState('equipment_damage');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidencePreviews, setEvidencePreviews] = useState([]);

  const handleCloseDisputeModal = () => {
    setDisputeModalOpen(false);
    setDisputeDesc('');
    setDisputeReason('equipment_damage');
    evidencePreviews.forEach(URL.revokeObjectURL);
    setEvidenceFiles([]);
    setEvidencePreviews([]);
  };

  const handleEvidenceFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (evidenceFiles.length + files.length > 3) {
      alert('You can upload a maximum of 3 evidence images.');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setEvidenceFiles((prev) => [...prev, ...validFiles]);
    setEvidencePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveEvidenceImage = (index) => {
    URL.revokeObjectURL(evidencePreviews[index]);
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
    setEvidencePreviews(evidencePreviews.filter((_, i) => i !== index));
  };

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchBookingsAndPayments = async () => {
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        API.get('/bookings/farmer'),
        API.get('/payments/farmer'),
      ]);
      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error('Failed to load farmer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndPayments();
  }, []);

  const handleCancelBooking = async (id, reason) => {
    try {
      await API.put(`/bookings/${id}/cancel`, { reason });
      alert('Booking request cancelled successfully.');
      fetchBookingsAndPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handlePaymentSubmit = async (paymentId, transactionId, method) => {
    try {
      await API.put(`/payments/${paymentId}/paid`, { transactionId, method });
      alert('Payment proof logged successfully! Status is now pending verification.');
      fetchBookingsAndPayments();
    } catch (err) {
      alert('Failed to log payment.');
    }
  };

  // Submit dispute handler
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingForDispute) return;
    try {
      const data = new FormData();
      data.append('bookingId', selectedBookingForDispute._id);
      data.append('reason', disputeReason);
      data.append('description', disputeDesc);

      evidenceFiles.forEach((file) => {
        data.append('evidenceImages', file);
      });

      await API.post('/disputes', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Dispute logged successfully. Status updated to Under Admin Review.');
      handleCloseDisputeModal();
      fetchBookingsAndPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log dispute.');
    }
  };

  // Submit review handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;
    try {
      await API.post('/reviews', {
        bookingId: selectedBookingForReview._id,
        rating,
        comment,
      });
      alert('Review posted successfully! Equipment rating updated.');
      setReviewModalOpen(false);
      setComment('');
      fetchBookingsAndPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post review.');
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
      <Sidebar role="farmer" />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        <MobileBackButton />
        
        {/* Title */}
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">My Rental Bookings 📅</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track scheduling approvals, upload transaction receipts, and log reviews.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-150 p-8 space-y-4">
            <span className="text-5xl block">🌾</span>
            <h3 className="font-extrabold text-gray-700 text-lg">No Booking History</h3>
            <p className="text-gray-450 text-xs max-w-xs mx-auto">
              You haven't requested any farm machinery rentals yet. Let's find some listings!
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
                  role="farmer"
                  onCancel={handleCancelBooking}
                  onPaymentSubmit={handlePaymentSubmit}
                  onDisputeClick={(b) => {
                    setSelectedBookingForDispute(b);
                    setDisputeModalOpen(true);
                  }}
                  onReviewClick={(b) => {
                    setSelectedBookingForReview(b);
                    setReviewModalOpen(true);
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Dispute Resolution Modal */}
        <Modal
          isOpen={disputeModalOpen}
          onClose={handleCloseDisputeModal}
          title="Report Dispute / Damage Claims ⚠️"
        >
          <form onSubmit={handleDisputeSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Select Dispute Reason *</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-xs"
              >
                <option value="equipment_damage">Equipment Damage / Leakage</option>
                <option value="late_return">Late Return by renter</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="wrong_information">Wrong Spec/Location details</option>
                <option value="booking_cancelled">Cancelled after pickup</option>
                <option value="other">Other issue</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Describe Details *</label>
              <textarea
                placeholder="Give exact details of damage, issues, or timeline failures..."
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Evidence Images (Optional, Max 3)</label>
              <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50 cursor-pointer relative hover:bg-gray-100/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEvidenceFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-xl">📷</span>
                <span className="text-[10px] text-gray-500 font-bold mt-1 text-center">Upload Evidence Photos</span>
              </div>
            </div>

            {evidencePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {evidencePreviews.map((img, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video h-12">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidenceImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Submit Dispute File
            </button>
          </form>
        </Modal>

        {/* Review Submission Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Rate & Review Machinery ⭐"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Select Rating Star *</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-xs font-bold text-yellow-600"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value="3">⭐⭐⭐ (3 - Average)</option>
                <option value="2">⭐⭐ (2 - Poor)</option>
                <option value="1">⭐ (1 - Terrible)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Renter Comments *</label>
              <textarea
                placeholder="How was the performance? Is it fuel efficient? Recommended for others?..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white font-bold py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Submit Review Feedback
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
};

export default FarmerBookings;
