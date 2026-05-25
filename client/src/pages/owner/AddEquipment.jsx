import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const AddEquipment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tractor',
    brand: '',
    model: '',
    rentPerDay: '',
    securityDeposit: '',
    imageUrl: '', // for adding image URLs
    address: '',
    city: '',
    longitude: '72.6711', // Sargodha default coordinates
    latitude: '32.0836',
    startDate: '',
    endDate: '',
  });

  const [imagesList, setImagesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAddImage = () => {
    if (formData.imageUrl.trim() !== '') {
      setImagesList([...imagesList, formData.imageUrl.trim()]);
      setFormData({ ...formData, imageUrl: '' });
    }
  };

  const handleRemoveImage = (index) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Your browser does not support geolocation.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          longitude: position.coords.longitude.toFixed(6).toString(),
          latitude: position.coords.latitude.toFixed(6).toString(),
        }));
      },
      (error) => {
        alert('Failed to access GPS. Check location settings.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, rentPerDay, city, address } = formData;

    if (!title || !description || !category || !rentPerDay || !city || !address) {
      setError('Please fill in title, description, category, rent, city, and address.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/equipment', {
        ...formData,
        images: imagesList.length > 0 ? imagesList : [formData.imageUrl || 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80'],
        rentPerDay: parseFloat(formData.rentPerDay),
        securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : 0,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
      });

      alert('Equipment listing submitted for admin verification!');
      navigate('/my-equipment');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit machinery listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role="owner" />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl mx-auto overflow-hidden bg-white border-l border-gray-200">
        
        {/* Title */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">List New Machinery 🚜</h2>
          <p className="text-gray-500 text-sm mt-1">
            Submit machinery specifications for admin verification.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          
          {/* Section 1: Core Details */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-2">Core Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Equipment Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. John Deere Tractor 5050D"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Machinery Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                >
                  <option value="tractor">Tractor 🚜</option>
                  <option value="harvester">Harvester 🌾</option>
                  <option value="seed_drill">Seed Drill 🌱</option>
                  <option value="sprayer">Sprayer 💧</option>
                  <option value="water_pump">Water Pump 🚿</option>
                  <option value="cultivator">Cultivator ⚙️</option>
                  <option value="plough">Plough 🛠️</option>
                  <option value="other">Other ⚙️</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Brand Name</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Kubota, Millat"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Model Name / Year</label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g. DC-70G"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold block mb-1">Description *</label>
              <textarea
                name="description"
                required
                placeholder="Detail the engine power, condition, fuel usage, and items included..."
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Availability */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-2">Pricing & Availability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Daily Rent Rate (PKR) *</label>
                <input
                  type="number"
                  name="rentPerDay"
                  required
                  placeholder="e.g. 5000"
                  value={formData.rentPerDay}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50 font-bold text-primary-800"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Security Deposit (PKR)</label>
                <input
                  type="number"
                  name="securityDeposit"
                  placeholder="e.g. 10000"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Availability Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Availability End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-base font-extrabold text-gray-800">Fleet Location</h3>
              <button
                type="button"
                onClick={getGPSLocation}
                className="text-xs text-primary-600 font-bold hover:underline"
              >
                🛰️ Get Coordinates (GPS)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">City / Town *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Sargodha"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Pickup Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g. Near Grid Station"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 block">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Images */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-2">Fleet Images</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                name="imageUrl"
                placeholder="Paste Image URL (Unsplash/Imgur)..."
                value={formData.imageUrl}
                onChange={handleChange}
                className="flex-grow border border-gray-300 rounded-lg p-2.5 bg-gray-50/50"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                + Add URL
              </button>
            </div>

            {imagesList.length > 0 && (
              <div className="grid grid-cols-4 gap-3 pt-2">
                {imagesList.map((img, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video h-16">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span>Submit Listing for Verification</span>
            )}
          </button>
        </form>

      </main>
    </div>
  );
};

export default AddEquipment;
