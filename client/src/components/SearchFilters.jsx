import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const SearchFilters = ({ filters, onChange, onSearch, onClear }) => {
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        setDbCategories(res.data);
      } catch (err) {
        console.error('Failed to load filter categories:', err);
      }
    };
    fetchCats();
  }, []);

  const categoriesList = [
    { value: '', label: 'All Categories' },
    ...dbCategories.map((c) => ({ value: c.value, label: `${c.label} ${c.icon || '🚜'}` })),
  ];

  const sortingOptions = [
    { value: 'newest', label: 'Newest Listings' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleGeoLocationToggle = () => {
    if (filters.useLocation) {
      onChange({
        ...filters,
        useLocation: false,
        longitude: '',
        latitude: '',
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            ...filters,
            useLocation: true,
            longitude: position.coords.longitude.toString(),
            latitude: position.coords.latitude.toString(),
          });
        },
        (error) => {
          alert('Failed to fetch your GPS location. Please check browser location permissions.');
        }
      );
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-5">
      <h3 className="font-extrabold text-gray-800 text-lg border-b border-gray-100 pb-3 flex items-center justify-between">
        <span>Filters ⚙️</span>
        <button onClick={onClear} className="text-xs text-red-500 font-semibold hover:underline">
          Clear All
        </button>
      </h3>

      <div className="space-y-4">
        {/* Search Keyword */}
        <div>
          <label className="text-xs text-gray-400 font-bold block mb-1">Search Keywords</label>
          <input
            type="text"
            name="keyword"
            placeholder="e.g. John Deere, Kubota"
            value={filters.keyword || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 bg-gray-50/50"
          />
        </div>

        {/* Category Select */}
        <div>
          <label className="text-xs text-gray-400 font-bold block mb-1">Machinery Category</label>
          <select
            name="category"
            value={filters.category || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 bg-gray-50/50"
          >
             {categoriesList.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="text-xs text-gray-400 font-bold block mb-1">City / Region</label>
          <input
            type="text"
            name="city"
            placeholder="e.g. Sargodha, Sahiwal"
            value={filters.city || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 bg-gray-50/50"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="text-xs text-gray-400 font-bold block mb-1">Daily Rent (PKR)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary-500 bg-gray-50/50"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-primary-500 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Rating filter */}
        <div>
          <label className="text-xs text-gray-400 font-bold block mb-1">Minimum Rating</label>
          <select
            name="rating"
            value={filters.rating || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 bg-gray-50/50"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars ⭐⭐⭐⭐</option>
            <option value="3">3+ Stars ⭐⭐⭐</option>
            <option value="2">2+ Stars ⭐⭐</option>
          </select>
        </div>

        {/* Sorting options */}
        <div>
          <label className="text-xs text-gray-400 font-bold block mb-1">Sort Results By</label>
          <select
            name="sort"
            value={filters.sort || 'newest'}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary-500 bg-gray-50/50"
          >
            {sortingOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location based toggle search */}
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleGeoLocationToggle}
            className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center space-x-1.5 ${
              filters.useLocation
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>📍</span>
            <span>{filters.useLocation ? 'Using My Location' : 'Search Near My Location'}</span>
          </button>
          {filters.useLocation && (
            <div className="mt-2">
              <label className="text-[10px] text-gray-400 font-bold block mb-1">Max Distance (meters)</label>
              <input
                type="number"
                name="maxDistance"
                value={filters.maxDistance || '50000'}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-1 text-xs focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        <button
          onClick={onSearch}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-xs"
        >
          🔍 Apply Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
