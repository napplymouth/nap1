import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

interface SiteNavProps {
  transparent?: boolean;
  onCartOpen?: () => void;
}

export default function SiteNav({ transparent = false, onCartOpen }: SiteNavProps) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(true);
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/training', label: 'Training & P2P' },
    { to: '/peer-support', label: 'Peer Support' },
    { to: '/events', label: 'Events' },
    { to: '/news', label: 'News' },
    { to: '/get-naloxone', label: 'Get Naloxone' },
    { to: '/safer-injection', label: 'Safer Injection' },
    { to: '/shop', label: 'Shop' },
    { to: '/resources', label: 'Resources' },
    { to: '/faq', label: 'FAQ' },
    { to: '/volunteer', label: 'Volunteer' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const bannerHeight = showEmergencyBanner ? 'top-10' : 'top-0';

  return (
    <>
      {/* Emergency Banner */}
      {showEmergencyBanner && (
        <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white py-2 px-4 flex items-center justify-between shadow-lg">
          <div className="flex-1" />
          <div className="flex items-center justify-center gap-3 flex-1">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-alarm-warning-fill text-yellow-300 text-lg animate-pulse" />
            </div>
            <span className="font-semibold text-sm tracking-wide">
              In an emergency, always call
            </span>
            <a
              href="tel:999"
              className="bg-white text-red-600 font-black text-lg px-4 py-0.5 rounded-full hover:bg-yellow-300 hover:text-red-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              999
            </a>
            <span className="font-semibold text-sm tracking-wide hidden sm:inline">
              — Naloxone is a temporary measure. Get professional help immediately.
            </span>
          </div>
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => setShowEmergencyBanner(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-700 transition-colors cursor-pointer"
              aria-label="Dismiss emergency banner"
            >
              <i className="ri-close-line text-white text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`fixed w-full z-40 transition-all duration-300 ${bannerHeight} ${
          isScrolled
            ? 'bg-white shadow-md'
            : 'bg-yellow-400 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="https://static.readdy.ai/image/cc651e60f2ff056ff8d9aa0b8741f321/e7410ce64ed135ba3fbccb4e7d1be15b.jpeg"
                alt="Naloxone Advocates Plymouth"
                className="h-14 w-auto"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-semibold text-sm transition-colors whitespace-nowrap ${
                    isActive(link.to)
                      ? 'text-pink-600'
                      : isScrolled
                      ? 'text-gray-900 hover:text-pink-500'
                      : 'text-gray-900 hover:text-pink-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              {onCartOpen && (
                <button
                  onClick={onCartOpen}
                  className="relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer hover:bg-black/10"
                >
                  <i className="ri-shopping-cart-line text-xl text-gray-900" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
              <Link
                to="/professionals/join"
                className="px-4 py-2 rounded-full font-bold text-sm transition-all shadow whitespace-nowrap flex items-center gap-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
              >
                <i className="ri-stethoscope-line" /> Professionals
              </Link>
              <Link
                to="/members/login"
                className="px-4 py-2 rounded-full font-bold text-sm transition-all shadow whitespace-nowrap flex items-center gap-2 bg-gray-900 text-yellow-400 hover:bg-gray-800"
              >
                <i className="ri-user-fill" /> Members
              </Link>
              <Link
                to="/booking"
                className="px-5 py-2 bg-pink-500 text-white rounded-full font-bold text-sm hover:bg-pink-600 transition-all shadow whitespace-nowrap"
              >
                Book Training
              </Link>
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-2">
              {onCartOpen && (
                <button
                  onClick={onCartOpen}
                  className="relative w-10 h-10 flex items-center justify-center cursor-pointer text-gray-900"
                >
                  <i className="ri-shopping-cart-line text-xl" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center cursor-pointer text-gray-900"
              >
                <i className={`text-2xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isActive(link.to)
                      ? 'bg-yellow-400 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/professionals/join"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg font-bold text-center"
              >
                Professional Training
              </Link>
              <Link
                to="/members/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 bg-gray-900 text-yellow-400 rounded-lg font-bold text-center"
              >
                Members Area
              </Link>
              <Link
                to="/booking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 bg-pink-500 text-white rounded-lg font-bold text-center"
              >
                Book Training
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div
        style={{
          height: showEmergencyBanner ? '120px' : '80px',
          transition: 'height 0.3s',
        }}
      />
    </>
  );
}