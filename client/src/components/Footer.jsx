import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0a2312] text-gray-200 border-t border-emerald-950/80 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-3xl">🚜</span>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                AgriRent
              </span>
            </Link>
            <p className="text-gray-300 text-xs leading-relaxed">
              Pakistan's premier farm equipment rental marketplace. Connecting small farmers with verified machinery owners to boost crop yield without heavy capital investment.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all text-xs font-bold text-gray-300">
                FB
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all text-xs font-bold text-gray-300">
                TW
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-all text-xs font-bold text-gray-300">
                LN
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="hidden md:block">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 pb-1.5 border-b border-emerald-800/40 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/equipment" className="hover:text-emerald-400 transition-colors">Browse Machinery</Link></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
              <li><a href="#categories" className="hover:text-emerald-400 transition-colors">Categories</a></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="hidden md:block">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 pb-1.5 border-b border-emerald-800/40 inline-block">
              Fleet Services
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li><Link to="/equipment?category=tractor" className="hover:text-emerald-400 transition-colors">Tractor Rental</Link></li>
              <li><Link to="/equipment?category=harvester" className="hover:text-emerald-400 transition-colors">Harvester Rental</Link></li>
              <li><Link to="/equipment?category=water_pump" className="hover:text-emerald-400 transition-colors">Water Pump Rental</Link></li>
              <li><Link to="/equipment?category=seed_drill" className="hover:text-emerald-400 transition-colors">Seed Drill Rental</Link></li>
              <li><Link to="/equipment?category=sprayer" className="hover:text-emerald-400 transition-colors">Sprayer Rental</Link></li>
              <li><Link to="/add-equipment" className="hover:text-emerald-400 transition-colors">List Your Equipment</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="hidden md:block">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 pb-1.5 border-b border-emerald-800/40 inline-block">
              Support & Guide
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Renter Guide</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Owner Guide</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Dispute Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 5: Contact Info */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 pb-1.5 border-b border-emerald-800/40 inline-block">
              Contact
            </h4>
            <ul className="space-y-3.5 text-xs text-gray-200">
              <li className="flex items-start space-x-2.5">
                <span className="text-sm">📧</span>
                <span className="hover:text-emerald-400 transition-colors">support@agrirent.com</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-sm">📞</span>
                <span className="hover:text-emerald-400 transition-colors">+92 300 1234567</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-sm">📍</span>
                <span>Punjab, Pakistan</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-emerald-950/60 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-300 gap-4">
          <div className="space-x-4">
            <span>&copy; {new Date().getFullYear()} AgriRent. All rights reserved.</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms & Conditions</a>
          </div>
          <div className="text-center md:text-right text-gray-300">
            <span>Developed for Advanced Web Technologies MERN Terminal evaluation.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
