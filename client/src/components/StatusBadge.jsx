import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyles = (statusVal) => {
    const normStatus = statusVal?.toLowerCase() || '';

    switch (normStatus) {
      // Bookings & Payments
      case 'pending':
      case 'pending_verification':
      case 'open':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      
      case 'approved':
      case 'paid':
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';

      case 'active':
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';

      case 'completed':
        return 'bg-primary-100 text-primary-800 border-primary-200';

      case 'rejected':
      case 'cancelled':
      case 'failed':
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';

      case 'disputed':
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';

      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLabel = (statusVal) => {
    if (!statusVal) return '';
    return statusVal
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyles(status)}`}>
      {getLabel(status)}
    </span>
  );
};

export default StatusBadge;
