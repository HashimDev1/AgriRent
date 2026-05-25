import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import EquipmentCard from '../../components/EquipmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyEquipment = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEquipment = async () => {
    try {
      const res = await API.get('/equipment/owner/my-equipment');
      setEquipment(res.data);
    } catch (err) {
      console.error('Failed to load fleet listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEquipment();
  }, []);

  const handleEdit = (item) => {
    navigate(`/equipment/${item._id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this machinery listing?')) return;
    try {
      await API.delete(`/equipment/${id}`);
      alert('Machinery listing deleted successfully.');
      fetchMyEquipment();
    } catch (err) {
      alert('Failed to delete listing.');
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
        
        {/* Title */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">My Rental Fleet 🚜</h2>
            <p className="text-gray-500 text-sm mt-1">
              Verify listing verification states and manage your equipment specs.
            </p>
          </div>
          <Link
            to="/add-equipment"
            className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-4 py-2.5 rounded-lg text-xs tracking-wide shadow-xs transition-colors"
          >
            + Add Machinery
          </Link>
        </div>

        {equipment.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-150 p-8 space-y-4">
            <span className="text-5xl block">🚜</span>
            <h3 className="font-extrabold text-gray-700 text-lg">No Machinery Listed Yet</h3>
            <p className="text-gray-400 text-xs max-w-xs mx-auto">
              Start earning by listing your idle agricultural pumps, tractors, or seed drills today.
            </p>
            <Link
              to="/add-equipment"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-xs mt-2 inline-block"
            >
              Add Equipment Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <EquipmentCard
                key={item._id}
                equipment={item}
                isOwnerView={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default MyEquipment;
