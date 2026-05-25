import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const equipmentId = searchParams.get('equipmentId');

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const [bookingDetails, setBookingDetails] = useState({
    startDate: '',
    endDate: '',
    purpose: '',
    pickupAddress: '',
  });

  useEffect(() => {
    if (!equipmentId) {
      setError('No equipment listing selected.');
      setLoading(false);
      return;
    }

    const fetchEquipment = async () => {
      try {
        const res = await API.get(`/equipment/${equipmentId}`);
        setEquipment(res.data);
        // Pre-fill default pickup address
        setBookingDetails((prev) => ({
          ...prev,
          pickupAddress: res.data.location?.address || '',
        }));
      } catch (err) {
        setError('Failed to fetch machinery details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  const handleChange = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
    setError('');
  };

  // Calculates total days and total cost
  const calculateCosts = () => {
    if (!bookingDetails.startDate || !bookingDetails.endDate || !equipment) {
      return { days: 0, total: 0 };
    }
    const start = new Date(bookingDetails.startDate);
    const end = new Date(bookingDetails.endDate);

    if (start >= end) {
      return { days: 0, total: 0, error: 'Start date must be before end date.' };
    }

    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const total = days * equipment.rentPerDay;
    return { days, total };
  };

  const costSummary = calculateCosts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate } = bookingDetails;

    if (!startDate || !endDate) {
      setError('Please select both start date and end date.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('Start date must be before end date.');
      return;
    }

    setSubmitLoading(true);
    try {
      await API.post('/bookings', {
        equipmentId,
        ...bookingDetails,
      });

      alert('Booking request created successfully!');
      navigate('/farmer-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Conflict detected or booking failure occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !equipment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back link */}
      <Link to={`/equipment/${equipmentId}`} className="text-sm font-bold text-primary-600 hover:text-primary-700">
        ← Back to Details
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Title */}
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Confirm Booking Schedule 📅</h2>
          <p className="text-gray-500 text-xs mt-1">
            Fill in details to request rental from the owner.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
          <span className="text-3xl">🚜</span>
          <div>
            <h4 className="font-extrabold text-gray-800 text-sm leading-snug">{equipment.title}</h4>
            <span className="text-xs text-gray-400 capitalize block mt-0.5">Category: {equipment.category}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Rental Start Date *</label>
              <input
                type="date"
                name="startDate"
                required
                value={bookingDetails.startDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Rental End Date *</label>
              <input
                type="date"
                name="endDate"
                required
                value={bookingDetails.endDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">Pickup Address / Notes</label>
            <input
              type="text"
              name="pickupAddress"
              placeholder="e.g. Near Sargodha bypass yard"
              value={bookingDetails.pickupAddress}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold block mb-1">Purpose of Rental</label>
            <textarea
              name="purpose"
              placeholder="Tell the owner how you plan to use this machinery (e.g., harvesting wheat, sowing)..."
              rows="3"
              value={bookingDetails.purpose}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
            />
          </div>

          {/* Pricing Summary */}
          {costSummary.days > 0 && (
            <div className="bg-primary-50/30 border border-primary-100 p-4 rounded-xl space-y-2">
              <span className="text-xs text-primary-800 font-bold uppercase tracking-wider block">Billing Summary</span>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Rent per Day</span>
                <span>PKR {equipment.rentPerDay}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Total Days</span>
                <span>{costSummary.days} Days</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 pb-2 border-b border-primary-100/50">
                <span>Security Deposit</span>
                <span>PKR {equipment.securityDeposit}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-extrabold text-gray-800">Total Rental Cost</span>
                <span className="text-xl font-extrabold text-primary-700">PKR {costSummary.total}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                * Security deposit is fully refundable upon safe return.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitLoading || costSummary.days === 0}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center"
          >
            {submitLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Submit Rental Request</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default CreateBooking;
