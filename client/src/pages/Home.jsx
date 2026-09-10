import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import RatingStars from '../components/RatingStars';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const defaultCategories = [
  { value: 'tractor', label: 'Tractor', subtitle: 'Land preparation', icon: '🚜', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg' },
  { value: 'harvester', label: 'Harvester', subtitle: 'Crop harvesting', icon: '🌾', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212834/agrirent/categories/lprumcwgvxluih9izhvh.jpg' },
  { value: 'seed_drill', label: 'Seed Drill', subtitle: 'Precision sowing', icon: '🌱', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212920/agrirent/categories/bphxixyjloaxop2d5g3l.jpg' },
  { value: 'sprayer', label: 'Sprayer', subtitle: 'Crop spraying', icon: '💧', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212891/agrirent/categories/dk7b0vvl1fepem7p0wmz.jpg' },
  { value: 'water_pump', label: 'Water Pump', subtitle: 'Irrigation support', icon: '🚿', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781214249/agrirent/categories/pugxszbdu1talbrdjqf5.jpg' },
  { value: 'cultivator', label: 'Cultivator', subtitle: 'Soil aeration', icon: '⚙️', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781212800/agrirent/categories/culylyvws4h2swvf8mmn.jpg' },
  { value: 'plough', label: 'Plough', subtitle: 'Deep tilling', icon: '🛠️', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781214209/agrirent/categories/fhho7ays9quvvsbmnjfg.jpg' },
  { value: 'other', label: 'Other Attachments', subtitle: 'General maintenance', icon: '⚙️', img: 'https://res.cloudinary.com/hashim055/image/upload/v1781214112/agrirent/equipment/i5ljph4awtdsx3ppdci8.jpg' },
];

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (image) => {
    if (!image) return '';
    return typeof image === 'object' && image.url ? image.url : image;
  };

  // Search input parameters
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchPriceRange, setSearchPriceRange] = useState('');
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [equipRes, catRes] = await Promise.all([
          API.get('/equipment'),
          API.get('/categories')
        ]);

        const approvedOnly = (equipRes.data || []).filter((e) => e.status === 'approved');
        if (approvedOnly.length > 0) {
          setFeatured(approvedOnly.slice(0, 4));
        } else {
          setFeatured([]);
        }

        if (catRes.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let query = `?city=${searchCity}&category=${searchCategory}`;
    if (searchPriceRange) {
      const [min, max] = searchPriceRange.split('-');
      query += `&minPrice=${min || ''}&maxPrice=${max || ''}`;
    }
    navigate(`/equipment${query}`);
  };

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      
      {/* 1. Hero & Search overlapping wrapper */}
      <div className="relative bg-gradient-to-br from-[#f7fbf7] via-[#eef7f0] to-[#f5f8f2] pb-32 pt-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        
        {/* Background visual designs */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-100 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-green-100/20 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column content */}
            <div className="lg:col-span-8 relative z-10 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-2xs">
                🌾 Pakistan’s Premium Farm Equipment Rental Marketplace
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
                Rent Farm Machinery <br />
                <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Without Heavy Investment
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Connect with verified local machinery owners. Rent tractors, harvesters, water pumps, sprayers, and cultivator attachments at transparent daily rates. Keep your harvest running efficiently.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Link
                  to="/equipment"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>🔍 Browse Machinery</span>
                </Link>
                <Link
                  to="/register?role=owner"
                  className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all text-center"
                >
                  🚜 List Your Equipment
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-2 max-w-lg mx-auto lg:mx-0 border-t border-gray-200 text-center lg:text-left">
                <div className="space-y-1">
                  <span className="text-emerald-700 font-extrabold text-sm block"> Verified Owners</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">CNIC & listing approved</span>
                </div>
                <div className="space-y-1 border-x border-gray-200 px-2">
                  <span className="text-emerald-700 font-extrabold text-sm block"> Fair Pricing</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Transparent daily rates</span>
                </div>
                <div className="space-y-1">
                  <span className="text-emerald-700 font-extrabold text-sm block"> Fast Booking</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">Direct owner approvals</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Machinery Image (Absolute Positioning behind text if screen narrows) */}
          <div className="hidden lg:block absolute right-0 lg:-right-40 top-1/2 -translate-y-1/2 w-[60%] max-w-[880px] h-[600px] pointer-events-none z-0">
            <img
              src="https://res.cloudinary.com/hashim055/image/upload/q_auto/f_auto/v1781218972/Create_an_isolated_3D_transparent_202606120355-Photoroom_ffqe8v.png"
              alt="Harvesting tractors in fields"
              className="w-full h-full object-contain object-right transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg';
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Overlapping Search Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-150 flex flex-col lg:flex-row gap-4 text-gray-800"
        >
          {/* City */}
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider ml-1">Location Region</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">📍</span>
              <input
                type="text"
                placeholder="Search city e.g. Multan, Sargodha"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-9 pr-4 text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider ml-1">Machinery Category</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🚜</span>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-9 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider ml-1">Daily Rent Budget</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">💰</span>
              <select
                value={searchPriceRange}
                onChange={(e) => setSearchPriceRange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-9 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              >
                <option value="">Any price range</option>
                <option value="0-2000">Under PKR 2,000</option>
                <option value="2000-5000">PKR 2,000 - 5,000</option>
                <option value="5000-10000">PKR 5,000 - 10,000</option>
                <option value="10000-25000">Above PKR 10,000</option>
              </select>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-end items-end pt-4 lg:pt-0">
            <button
              type="submit"
              className="w-full lg:w-auto bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md shrink-0 flex items-center justify-center space-x-2"
            >
              <span>🔍 Find Machinery</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. Browse by Category Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-primary-700 font-extrabold text-xs uppercase tracking-widest block">Fleet Collections</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">Browse Machinery Categories</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Find specialized agricultural equipment matching your specific seasonal harvest or tilling requirements.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/equipment?category=${cat.value}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden hover-card flex flex-col h-full"
            >
              <div className="h-32 bg-gray-50 overflow-hidden relative">
                <img
                  src={typeof cat.img === 'object' && cat.img ? cat.img.url : cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-primary-950/20 group-hover:bg-primary-950/10 transition-colors"></div>
                <span className="absolute bottom-2 left-3 text-2xl drop-shadow-md">{cat.icon}</span>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-center">
                <h4 className="font-extrabold text-gray-800 text-sm group-hover:text-primary-700 transition-colors">
                  {cat.label}
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="bg-primary-50/40 border-y border-primary-100/30 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-primary-700 font-extrabold text-xs uppercase tracking-widest block">Process Timeline</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">How AgriRent Works</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Our digital matching platform makes rental listings, scheduler bookings, and payments simple and safe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Stepper timeline line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-100 -translate-y-1/2 hidden md:block z-0"></div>

            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150/80 shadow-3xs flex flex-col items-center text-center space-y-4 relative z-10 hover-card">
              <span className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-extrabold text-lg flex items-center justify-center border-4 border-white shadow-sm">
                1
              </span>
              <h4 className="font-extrabold text-gray-850 text-base">Search Machinery</h4>
              <p className="text-xs text-gray-450 leading-relaxed">
                Filter nearby tractors or attachments based on daily rates, city location, specific category, and owner feedback score.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150/80 shadow-3xs flex flex-col items-center text-center space-y-4 relative z-10 hover-card">
              <span className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-extrabold text-lg flex items-center justify-center border-4 border-white shadow-sm">
                2
              </span>
              <h4 className="font-extrabold text-gray-850 text-base">Send Booking Request</h4>
              <p className="text-xs text-gray-450 leading-relaxed">
                Choose desired booking start and end dates. System verifies scheduling conflicts. Submit request directly to equipment owner for approval.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150/80 shadow-3xs flex flex-col items-center text-center space-y-4 relative z-10 hover-card">
              <span className="w-12 h-12 rounded-full bg-[#169143] text-white font-extrabold text-lg flex items-center justify-center border-4 border-primary-100 shadow-sm animate-pulse">
                3
              </span>
              <h4 className="font-extrabold text-gray-850 text-base">Start Farming</h4>
              <p className="text-xs text-gray-450 leading-relaxed">
                Pick up machinery from pickup depot, execute your operations, log payments online, and submit rating reviews upon safe return.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Machinery Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-100 pb-5 gap-4">
          <div className="space-y-2">
            <span className="text-primary-700 font-extrabold text-xs uppercase tracking-widest block">Featured Listings</span>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Machinery Fleet For Rent</h2>
            <p className="text-gray-500 text-sm">Rent top-tier verified machinery at standard rates.</p>
          </div>
          <Link
            to="/equipment"
            className="text-sm font-extrabold text-primary-600 hover:text-[#157238] flex items-center space-x-1"
          >
            <span>View Complete Catalogue</span>
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-150 shadow-3xs overflow-hidden hover-card flex flex-col h-full">
                
                {/* Image */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={getImageUrl(item.images?.[0]) || 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://res.cloudinary.com/hashim055/image/upload/v1781209752/agrirent/equipment/qoio5kqeuxzh9ey0ybtw.jpg';
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-extrabold uppercase text-primary-700 border border-white/20">
                    {item.category?.replace('_', ' ')}
                  </span>
                  {item.status && (
                    <div className="absolute top-3 right-3 text-[9px]">
                      <StatusBadge status={item.status} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow space-y-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-gray-400">
                    <span>📍</span>
                    <span className="capitalize font-bold text-gray-500">{item.location?.city || 'Sargodha'}</span>
                    {item.brand && (
                      <>
                        <span className="text-gray-250">•</span>
                        <span className="font-semibold text-gray-500">{item.brand}</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-850 text-sm leading-snug line-clamp-1 hover:text-primary-700">
                    <Link to={`/equipment/${item._id}`}>{item.title}</Link>
                  </h3>

                  <div>
                    <RatingStars rating={item.averageRating} count={5} size="xs" />
                  </div>

                  <p className="text-gray-450 line-clamp-2 leading-relaxed flex-grow">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-gray-50 flex items-baseline justify-between">
                    <div>
                      <span className="text-primary-700 font-extrabold text-base">PKR {item.rentPerDay}</span>
                      <span className="text-[9px] text-gray-400 font-medium"> / day</span>
                    </div>
                    {item.securityDeposit > 0 && (
                      <span className="text-[10px] text-gray-400">Deposit: PKR {item.securityDeposit}</span>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/equipment/${item._id}`}
                      className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-2 px-4 rounded-lg text-[10px]"
                    >
                      ⚙️ View Details
                    </Link>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Why Choose AgriRent Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-primary-700 font-extrabold text-xs uppercase tracking-widest block">Platform Core Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">Why Choose AgriRent</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            We solve key agricultural issues through direct, transparent machinery rentals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 hover-card">
            {/* <span className="text-3xl block p-2 bg-primary-50 rounded-xl w-fit">🛡️</span> */}
            <h4 className="font-extrabold text-gray-850 text-sm">Verified Equipment Owners</h4>
            <p className="text-xs text-gray-450 leading-relaxed">
              Every equipment owner uploads CNIC credentials and listing details checked by administrators.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 hover-card">
            {/* <span className="text-3xl block p-2 bg-earth-50 rounded-xl w-fit">💰</span> */}
            <h4 className="font-extrabold text-gray-850 text-sm">Transparent Daily Rent</h4>
            <p className="text-xs text-gray-450 leading-relaxed">
              Rent features clearly display rent-per-day rates and security deposits with zero hidden operational fees.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 hover-card">
            {/* <span className="text-3xl block p-2 bg-blue-50 rounded-xl w-fit">📦</span> */}
            <h4 className="font-extrabold text-gray-850 text-sm">Booking Status Tracking</h4>
            <p className="text-xs text-gray-450 leading-relaxed">
              Monitor your booking states step-by-step from pending request to active delivery pickup.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 hover-card">
            {/* <span className="text-3xl block p-2 bg-purple-50 rounded-xl w-fit">⚖️</span> */}
            <h4 className="font-extrabold text-gray-850 text-sm">Damage & Dispute Support</h4>
            <p className="text-xs text-gray-450 leading-relaxed">
              Admin arbitrates damage disputes using evidence images and description reports to keep both sides secure.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Owner CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#14532d] via-[#135c2f] to-[#583c2c] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="space-y-4 max-w-2xl text-center lg:text-left relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">Own Farm Machinery? Start Earning Today.</h2>
            <p className="text-[#dcfce7] text-sm leading-relaxed">
              List your idle tractors, harvesters, cultivators, water pumps, or seeding tools. Review booking requests, approve scheduling windows, and grow your seasonal income safely.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <Link
              to="/register?role=owner"
              className="bg-white text-slate-900 font-extrabold px-6 py-3.5 rounded-xl text-sm transition-all hover:bg-primary-50 text-center shadow-md flex-1 sm:flex-initial"
            >
              Register as Owner
            </Link>
            <Link
              to="/add-equipment"
              className="bg-primary-600 hover:bg-[#157238] border border-primary-500 text-white font-extrabold px-6 py-3.5 rounded-xl text-sm transition-all text-center shadow-md flex-1 sm:flex-initial"
            >
              List Machinery
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-primary-700 font-extrabold text-xs uppercase tracking-widest block">Success Stories</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">What Farmers Say</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Read experience reports from small-scale farmers and machine fleet owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-4 flex flex-col justify-between hover-card">
            <p className="text-xs text-gray-500 leading-relaxed italic">
              "AgriRent helped me find a Kubota harvester during peak wheat crop season without calling multiple agents. Saved us crucial tilling time!"
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="Farmer portrait"
                className="w-9 h-9 rounded-full object-cover border border-primary-200"
              />
              <div>
                <span className="font-bold text-gray-800 text-xs block">Irfan Ahmad</span>
                <span className="text-[10px] text-gray-400 font-bold block">Wheat Farmer, Sargodha</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-4 flex flex-col justify-between hover-card">
            <p className="text-xs text-gray-500 leading-relaxed italic">
              "The booking date overlap checker is brilliant. I requested a Massey Ferguson tractor for 3 days, paid easily via Easypaisa, and picked it up safely."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                alt="Farmer portrait"
                className="w-9 h-9 rounded-full object-cover border border-primary-200"
              />
              <div>
                <span className="font-bold text-gray-800 text-xs block">Kamran Khan</span>
                <span className="text-[10px] text-gray-400 font-bold block">Farmer, Multan</span>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-4 flex flex-col justify-between hover-card">
            <p className="text-xs text-gray-500 leading-relaxed italic">
              "My Peter water pumps were idle for months after rice harvest. Now I list them on AgriRent and receive steady rental requests from neighboring regions."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                alt="Owner portrait"
                className="w-9 h-9 rounded-full object-cover border border-primary-200"
              />
              <div>
                <span className="font-bold text-gray-800 text-xs block">Sajid Mahmood</span>
                <span className="text-[10px] text-gray-400 font-bold block">Fleet Owner, Sahiwal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
