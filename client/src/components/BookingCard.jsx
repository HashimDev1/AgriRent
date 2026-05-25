import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const BookingCard = ({
  booking,
  payment,
  role,
  onApprove,
  onReject,
  onCancel,
  onActive,
  onComplete,
  onPaymentSubmit,
  onDisputeClick,
  onReviewClick,
}) => {
  const [responseMsg, setResponseMsg] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [transId, setTransId] = useState('');
  const [payMethod, setPayMethod] = useState('easypaisa');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const startStr = new Date(booking.startDate).toLocaleDateString();
  const endStr = new Date(booking.endDate).toLocaleDateString();

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Top Header */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
        <div>
          <h4 className="font-extrabold text-gray-800 text-lg leading-snug">
            {booking.equipmentId?.title || 'Machinery Listing'}
          </h4>
          <p className="text-xs text-gray-400 mt-1">Booking Ref: #{booking._id}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Booking Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-sm">
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-700">Rental Period:</span> {startStr} - {endStr}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-700">Duration:</span> {booking.totalDays} Days
          </p>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-700">Total Amount:</span>{' '}
            <span className="text-primary-700 font-bold">PKR {booking.totalAmount}</span>
          </p>
          {booking.pickupAddress && (
            <p className="text-gray-600">
              <span className="font-semibold text-gray-700">Pickup Address:</span> {booking.pickupAddress}
            </p>
          )}
        </div>

        <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
          {role === 'owner' ? (
            <>
              <p className="font-bold text-gray-700 mb-1">Renter Contact:</p>
              <p className="text-gray-600"><span className="text-gray-400">Name:</span> {booking.renterId?.name}</p>
              <p className="text-gray-600"><span className="text-gray-400">Phone:</span> {booking.renterId?.phone}</p>
              {booking.purpose && (
                <p className="text-gray-600"><span className="text-gray-400">Purpose:</span> {booking.purpose}</p>
              )}
            </>
          ) : (
            <>
              <p className="font-bold text-gray-700 mb-1">Owner Contact:</p>
              <p className="text-gray-600"><span className="text-gray-400">Name:</span> {booking.ownerId?.name}</p>
              <p className="text-gray-600"><span className="text-gray-400">Phone:</span> {booking.ownerId?.phone}</p>
            </>
          )}

          {payment && (
            <p className="text-gray-600">
              <span className="font-semibold text-gray-700">Payment Status:</span>{' '}
              <span className={`font-semibold ${payment.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                {payment.paymentStatus.toUpperCase()} ({payment.method.toUpperCase()})
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Responses block */}
      {booking.ownerResponseMessage && (
        <div className="bg-gray-50 border-l-4 border-primary-500 p-3 rounded-r-lg mb-4 text-xs text-gray-600">
          <span className="font-bold text-gray-700 block mb-0.5">Owner Response Message:</span>
          "{booking.ownerResponseMessage}"
        </div>
      )}
      {booking.cancellationReason && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg mb-4 text-xs text-gray-600">
          <span className="font-bold text-gray-700 block mb-0.5">Cancellation Reason:</span>
          "{booking.cancellationReason}"
        </div>
      )}

      {/* Booking Actions Router Block */}
      <div className="pt-3 border-t border-gray-50 flex flex-wrap gap-2 items-center">
        {/* Owner actions */}
        {role === 'owner' && booking.status === 'pending' && !showRejectForm && (
          <div className="flex w-full space-x-2">
            <button
              onClick={() => onApprove(booking._id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
            >
              Approve Request
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg text-xs transition-colors"
            >
              Reject Request
            </button>
          </div>
        )}

        {role === 'owner' && booking.status === 'pending' && showRejectForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onReject(booking._id, responseMsg);
              setShowRejectForm(false);
            }}
            className="w-full space-y-2 mt-2"
          >
            <input
              type="text"
              placeholder="Enter rejection reason message..."
              value={responseMsg}
              onChange={(e) => setResponseMsg(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500"
              required
            />
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
                Submit Rejection
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-1.5 px-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {role === 'owner' && booking.status === 'approved' && (
          <button
            onClick={() => onActive(booking._id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
          >
            🚚 Mark as Active (Picked Up)
          </button>
        )}

        {role === 'owner' && booking.status === 'active' && (
          <button
            onClick={() => onComplete(booking._id)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
          >
            ✓ Mark as Completed (Returned)
          </button>
        )}

        {/* Farmer Actions */}
        {role === 'farmer' && booking.status === 'pending' && !showCancelForm && (
          <button
            onClick={() => setShowCancelForm(true)}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg text-xs transition-colors"
          >
            Cancel Request
          </button>
        )}

        {role === 'farmer' && booking.status === 'pending' && showCancelForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCancel(booking._id, cancelReason);
              setShowCancelForm(false);
            }}
            className="w-full space-y-2 mt-2"
          >
            <input
              type="text"
              placeholder="Why are you cancelling?..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-red-500"
              required
            />
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
                Cancel Booking
              </button>
              <button
                type="button"
                onClick={() => setShowCancelForm(false)}
                className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-1.5 px-3 rounded-lg"
              >
                Go Back
              </button>
            </div>
          </form>
        )}

        {role === 'farmer' && booking.status === 'approved' && payment && payment.paymentStatus === 'pending' && !showPaymentForm && (
          <button
            onClick={() => setShowPaymentForm(true)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-sm"
          >
            💳 Submit Online Payment Proof
          </button>
        )}

        {role === 'farmer' && booking.status === 'approved' && payment && payment.paymentStatus === 'pending' && showPaymentForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onPaymentSubmit(payment._id, transId, payMethod);
              setShowPaymentForm(false);
            }}
            className="w-full space-y-2 mt-2 border border-primary-100 p-3 rounded-lg bg-primary-50/20"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Select Channel</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full border border-gray-300 bg-white rounded-lg p-1.5 text-xs"
                >
                  <option value="easypaisa">Easypaisa</option>
                  <option value="jazzcash">Jazzcash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Debit/Credit Card</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Transaction Ref ID</label>
                <input
                  type="text"
                  placeholder="e.g. TR-2819830"
                  value={transId}
                  onChange={(e) => setTransId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 bg-primary-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg">
                Submit Payment
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-1.5 px-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {role === 'farmer' && booking.status === 'completed' && (
          <button
            onClick={() => onReviewClick(booking)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
          >
            ⭐ Submit Review & Stars
          </button>
        )}

        {/* Dispute Resolution trigger */}
        {(booking.status === 'active' || booking.status === 'completed' || booking.status === 'disputed') && (
          <button
            onClick={() => onDisputeClick(booking)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
          >
            ⚠️ Report Damage / Dispute
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
