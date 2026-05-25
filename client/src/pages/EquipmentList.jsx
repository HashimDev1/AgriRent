import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import EquipmentCard from '../components/EquipmentCard';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';

const EquipmentList = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);
  
  // Search parameters filter state
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: 'newest',
    useLocation: false,
    longitude: '',
    latitude: '',
    maxDistance: '50000',
  });

  const fetchEquipment = async (params = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined && key !== 'useLocation') {
          queryParams.append(key, params[key]);
        }
      });

      const res = await API.get(`/equipment/search?${queryParams.toString()}`);
      setEquipment(res.data);
    } catch (err) {
      console.error('Failed to search equipment fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch using URL parameters
    const initialParams = {
      ...filters,
      keyword: searchParams.get('keyword') || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
    };
    setFilters(initialParams);
    fetchEquipment(initialParams);
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearchSubmit = () => {
    fetchEquipment();
  };

  const handleClearFilters = () => {
    const cleared = {
      keyword: '',
      category: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'newest',
      useLocation: false,
      longitude: '',
      latitude: '',
      maxDistance: '50000',
    };
    setFilters(cleared);
    fetchEquipment(cleared);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Farm Equipment Catalog 🌱</h2>
        <p className="text-gray-500 text-sm mt-1">
          Explore and rent verified machinery from owners near your area.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters
            filters={filters}
            onChange={handleFilterChange}
            onSearch={handleSearchSubmit}
            onClear={handleClearFilters}
          />
        </div>

        {/* Right Listings Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : equipment.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-150 p-8 space-y-4">
              <span className="text-5xl block">🚜</span>
              <h3 className="font-extrabold text-gray-700 text-lg">No Machinery Found</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                No active listings match your current filters. Try expanding your search queries or clearing filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
              >
                Clear Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((item) => (
                <EquipmentCard key={item._id} equipment={item} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EquipmentList;
