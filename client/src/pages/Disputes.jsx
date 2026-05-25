import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await API.get('/disputes/my');
        setDisputes(res.data);
      } catch (err) {
        console.error('Failed to load user disputes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role={localStorage.getItem('token') ? (disputes[0]?.createdBy?.role === 'owner' ? 'owner' : 'farmer') : 'farmer'} />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Title */}
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Rental Disputes Log ⚠️</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track claims for damaged equipment, schedule breaches, or transaction discrepancies.
          </p>
        </div>

        {disputes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-150 p-8 space-y-4">
            <span className="text-5xl block">🛡️</span>
            <h3 className="font-extrabold text-gray-700 text-lg">No Logged Disputes</h3>
            <p className="text-gray-400 text-xs max-w-xs mx-auto">
              Your rental history is clean! You have not logged any disputes, and no claims have been filed against you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => {
              const createdDate = new Date(dispute.createdAt).toLocaleDateString();
              const isCreator = dispute.createdBy?._id === dispute.createdBy?._id; // simplified, we can check matching id

              return (
                <div key={dispute._id} className="bg-white rounded-xl border border-gray-150 p-5 shadow-3xs space-y-3">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">
                        Dispute on Booking #{dispute.bookingId?._id?.slice(-8)}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Filed: {createdDate}</p>
                    </div>
                    <StatusBadge status={dispute.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 font-bold block mb-0.5">Issue Category:</span>
                      <span className="font-bold text-gray-700 uppercase">{dispute.reason.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block mb-0.5">Counterparty Involved:</span>
                      <span className="font-bold text-gray-700">{dispute.againstUserId?.name} ({dispute.againstUserId?.role})</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block mb-0.5">Machinery:</span>
                      <span className="font-bold text-gray-700">{dispute.equipmentId?.title}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1.5 border border-gray-100">
                    <span className="font-bold text-gray-600 block">Dispute Description:</span>
                    <p className="text-gray-500 leading-relaxed">"{dispute.description}"</p>
                  </div>

                  {dispute.adminRemarks && (
                    <div className="bg-purple-50/30 border-l-4 border-purple-600 p-3 rounded-r-lg text-xs">
                      <span className="font-bold text-purple-700 block mb-0.5">Admin Action / Remarks:</span>
                      <p className="text-gray-600 italic">"{dispute.adminRemarks}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default Disputes;
