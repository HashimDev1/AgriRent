import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import MobileBackButton from '../../components/MobileBackButton';

const EditEquipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    rentPerDay: '',
    securityDeposit: '',
    address: '',
    city: '',
    longitude: '',
    latitude: '',
    startDate: '',
    endDate: '',
    isAvailable: true,
  });

  const [imagesList, setImagesList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await API.get(`/equipment/${id}`);
        const eq = res.data;
        
        setFormData({
          title: eq.title || '',
          description: eq.description || '',
          category: eq.category || 'tractor',
          brand: eq.brand || '',
          model: eq.model || '',
          rentPerDay: eq.rentPerDay || '',
          securityDeposit: eq.securityDeposit || '',
          address: eq.location?.address || '',
          city: eq.location?.city || '',
          longitude: eq.location?.coordinates?.[0]?.toString() || '',
          latitude: eq.location?.coordinates?.[1]?.toString() || '',
          startDate: eq.availability?.startDate ? new Date(eq.availability.startDate).toISOString().split('T')[0] : '',
          endDate: eq.availability?.endDate ? new Date(eq.availability.endDate).toISOString().split('T')[0] : '',
          isAvailable: eq.isAvailable !== undefined ? eq.isAvailable : true,
        });

        if (eq.images) {
          setImagesList(eq.images);
        }
      } catch (err) {
        setError('Failed to fetch machinery details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (imagesList.length + selectedFiles.length + files.length > 5) {
      alert('You can upload a maximum of 5 images total.');
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
        alert(`${file.name} exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  const handleRemoveExistingImage = (index) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
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

    setSubmitLoading(true);
    try {
      const data = new FormData();

      // Append normal form fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append existing images JSON list
      data.append('images', JSON.stringify(imagesList));

      // Append new files
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      await API.put(`/equipment/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Equipment listing updated successfully! Requires admin re-verification.');
      navigate('/my-equipment');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update machinery listing.');
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

  return (
    <div className="flex bg-gray-50/50 min-h-screen">
      <Sidebar role="owner" />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl mx-auto overflow-hidden bg-white border-l border-gray-200">
        <MobileBackButton />
        
        {/* Title */}
        <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Edit Machinery Listing ⚙️</h2>
            <p className="text-gray-500 text-sm mt-1">
              Changes will reset status to pending verification.
            </p>
          </div>
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
            />
            <span>Available for Rent</span>
          </label>
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
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} {c.icon || '🚜'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold block mb-1">Brand Name</label>
                <input
                  type="text"
                  name="brand"
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
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="text-3xl mb-2">📸</span>
              <span className="text-xs text-gray-500 font-bold text-center">Click to upload new images (Max 5 total)</span>
              <span className="text-[10px] text-gray-400 mt-1">Only image formats under 5MB are supported</span>
            </div>

            {/* Existing Images */}
            {imagesList.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 block">Current Images:</span>
                <div className="grid grid-cols-4 gap-3">
                  {imagesList.map((img, idx) => {
                    const url = typeof img === 'object' ? img.url : img;
                    return (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video h-16 bg-gray-50">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs hover:bg-red-700 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Previews */}
            {previews.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 block">New Uploads Preview:</span>
                <div className="grid grid-cols-4 gap-3">
                  {previews.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video h-16 bg-gray-50">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center"
          >
            {submitLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span>Save & Update Listing</span>
            )}
          </button>
        </form>

      </main>
    </div>
  );
};

export default EditEquipment;
