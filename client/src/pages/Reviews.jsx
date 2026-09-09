import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import RatingStars from '../components/RatingStars';
import LoadingSpinner from '../components/LoadingSpinner';

const Reviews = () => {
  const [searchParams] = useSearchParams();
  const equipmentId = searchParams.get('equipmentId');

  const [reviews, setReviews] = useState([]);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (equipmentId) {
          const [equipRes, reviewRes] = await Promise.all([
            API.get(`/equipment/${equipmentId}`),
            API.get(`/reviews/equipment/${equipmentId}`),
          ]);
          setEquipment(equipRes.data);
          setReviews(reviewRes.data);
        } else {
          // If no specific equipment ID is specified, we fetch all reviews
          // for one of the owner's equipment, or show placeholder details.
          // For simplicity, we fallback to empty list.
          setReviews([]);
        }
      } catch (err) {
        console.error('Failed to load reviews list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [equipmentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Machinery Reviews Feedback 💬</h2>
        {equipment && (
          <p className="text-gray-500 text-sm mt-1">
            Displaying feedback reviews for: <Link to={`/equipment/${equipment._id}`} className="font-bold text-primary-600 hover:underline">{equipment.title}</Link>
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-150 p-8 space-y-3">
          <span className="text-5xl block">⭐</span>
          <h3 className="font-extrabold text-gray-700 text-base">No Feedback Reviews</h3>
          <p className="text-gray-400 text-xs max-w-xs mx-auto">
            This equipment listing has not received any reviews from renters.
          </p>
          <Link to="/equipment" className="text-xs text-primary-600 font-bold hover:underline">
            Browse machinery catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-white rounded-xl border border-gray-150 p-5 shadow-3xs space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <img
                    src={(rev.reviewerId?.profileImage?.url || rev.reviewerId?.profileImage) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={rev.reviewerId?.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-bold text-gray-700">{rev.reviewerId?.name}</span>
                </div>
                <span className="text-gray-400 font-medium">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <RatingStars rating={rev.rating} count={5} size="xs" />
              </div>
              <p className="text-gray-650 leading-relaxed italic font-medium">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Reviews;
