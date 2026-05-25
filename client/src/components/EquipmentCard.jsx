import React from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import StatusBadge from './StatusBadge';

const EquipmentCard = ({ equipment, isOwnerView = false, onEdit, onDelete }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80';
  const imgUrl = equipment.images && equipment.images.length > 0 ? equipment.images[0] : fallbackImage;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-card flex flex-col h-full">
      {/* Listing Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={imgUrl}
          alt={equipment.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase text-primary-700 tracking-wider shadow-xs border border-white/40">
          {equipment.category?.replace('_', ' ')}
        </div>
        {isOwnerView && (
          <div className="absolute top-3 right-3">
            <StatusBadge status={equipment.status} />
          </div>
        )}
      </div>

      {/* Listing Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
          <span>📍</span>
          <span className="capitalize">{equipment.location?.city || 'Sargodha'}</span>
          {equipment.brand && (
            <>
              <span className="text-gray-300">•</span>
              <span className="font-semibold text-gray-500">{equipment.brand}</span>
            </>
          )}
        </div>

        <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-1 hover:text-primary-700 mb-1.5">
          <Link to={`/equipment/${equipment._id}`}>{equipment.title}</Link>
        </h3>

        {/* Rating Row */}
        <div className="mb-3">
          <RatingStars rating={equipment.averageRating} count={5} size="xs" />
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 mb-4 flex-grow">
          {equipment.description}
        </p>

        {/* Pricing Row */}
        <div className="flex items-baseline justify-between pt-3 border-t border-gray-50">
          <div>
            <span className="text-primary-700 font-extrabold text-lg">PKR {equipment.rentPerDay}</span>
            <span className="text-[10px] text-gray-400 font-medium"> / day</span>
          </div>
          {equipment.securityDeposit > 0 && (
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Deposit: PKR {equipment.securityDeposit}</span>
            </div>
          )}
        </div>

        {/* Actions Button */}
        <div className="mt-4 pt-1">
          {isOwnerView ? (
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(equipment)}
                className="flex-1 text-center bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-semibold py-2 px-3 rounded-lg text-xs border border-gray-200 hover:border-primary-200 transition-all"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDelete(equipment._id)}
                className="flex-1 text-center bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold py-2 px-3 rounded-lg text-xs border border-red-100 hover:border-red-200 transition-all"
              >
                🗑️ Delete
              </button>
            </div>
          ) : (
            <Link
              to={`/equipment/${equipment._id}`}
              className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs tracking-wide shadow-xs hover:shadow-md transition-all duration-200"
            >
              ⚙️ View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
