import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';

const EquipmentDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [equipment, setEquipment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [equipRes, reviewRes] = await Promise.all([
          API.get(`/equipment/${id}`),
          API.get(`/reviews/equipment/${id}`),
        ]);
        setEquipment(equipRes.data);
        setReviews(reviewRes.data);
        if (equipRes.data.images && equipRes.data.images.length > 0) {
          setActiveImage(equipRes.data.images[0]);
        }
      } catch (err) {
        console.error('Failed to load details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        Machinery listing not found.
      </div>
    );
  }

  const isOwner = user && equipment.ownerId?._id === user._id;
  const isFarmer = !user || user.role === 'farmer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <Link to="/equipment" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1">
        <span>← Back to Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-video max-h-[400px]">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=700&q=80'}
              alt={equipment.title}
              className="w-full h-full object-cover"
            />
          </div>
          {equipment.images && equipment.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {equipment.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${
                    activeImage === img ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Specifications & Booking CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide border border-primary-100 inline-block">
              {equipment.category?.replace('_', ' ')}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight leading-snug">
              {equipment.title}
            </h2>
            <div className="flex items-center space-x-3 text-xs">
              <RatingStars rating={equipment.averageRating} count={5} size="xs" />
              <span className="text-gray-400">|</span>
              <span className="text-gray-500 font-semibold">{equipment.totalReviews} Reviews</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Daily Rent</span>
              <span className="text-2xl font-extrabold text-primary-700">PKR {equipment.rentPerDay}</span>
            </div>
            {equipment.securityDeposit > 0 && (
              <div className="text-right">
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Security Deposit</span>
                <span className="text-lg font-bold text-gray-700">PKR {equipment.securityDeposit}</span>
              </div>
            )}
          </div>

          {/* Specs Details */}
          <div className="grid grid-cols-2 gap-4 text-xs border-y border-gray-100 py-4">
            <div>
              <span className="text-gray-400 block font-bold mb-0.5">Brand / Model</span>
              <span className="font-bold text-gray-700">{equipment.brand || 'N/A'} - {equipment.model || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-bold mb-0.5">Location City</span>
              <span className="font-bold text-gray-700 capitalize">{equipment.location?.city || 'Sargodha'}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-bold mb-0.5">Address</span>
              <span className="font-semibold text-gray-600 truncate block" title={equipment.location?.address}>
                {equipment.location?.address || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block font-bold mb-0.5">Verified Listing</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${equipment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {equipment.status?.toUpperCase()?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Owner Box info */}
          {equipment.ownerId && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Machinery Owner</span>
              <div className="flex items-center space-x-3">
                <img
                  className="h-10 w-10 rounded-full object-cover border border-primary-200"
                  src={equipment.ownerId.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={equipment.ownerId.name}
                />
                <div>
                  <h5 className="font-bold text-gray-700 text-sm">{equipment.ownerId.name}</h5>
                  <span className="text-[10px] text-gray-400 font-semibold">{equipment.ownerId.isVerified ? 'Verified Owner ✓' : 'Verification Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Button Trigger */}
          <div className="pt-2">
            {isOwner ? (
              <div className="text-center p-3 bg-primary-50 rounded-lg text-primary-800 text-xs font-bold border border-primary-100">
                🚜 This is your equipment listing.
              </div>
            ) : isFarmer ? (
              <Link
                to={`/bookings/create?equipmentId=${equipment._id}`}
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 px-6 rounded-xl text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-200"
              >
                📅 Request Booking / Check Schedule
              </Link>
            ) : (
              <div className="text-center p-3 bg-red-50 rounded-lg text-red-800 text-xs font-semibold">
                Must be logged in as a Farmer to book this machinery.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Body */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-3">
        <h3 className="font-extrabold text-gray-800 text-lg border-b border-gray-100 pb-2">Description</h3>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{equipment.description}</p>
      </div>

      {/* Reviews Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-6">
        <h3 className="font-extrabold text-gray-800 text-lg border-b border-gray-100 pb-2">
          Renter Reviews ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">
            No reviews submitted for this machinery yet.
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-gray-100">
            {reviews.map((rev) => (
              <div key={rev._id} className="pt-4 first:pt-0 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={rev.reviewerId?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-bold text-gray-700">{rev.reviewerId?.name}</span>
                  </div>
                  <span className="text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <RatingStars rating={rev.rating} count={5} size="xs" />
                </div>
                <p className="text-gray-500 leading-relaxed font-medium italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default EquipmentDetails;
