import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '#home' },
    { name: 'Profil', href: '#profile' },
    { name: 'Syarat & Alur', href: '#info' },
    { name: 'Jadwal', href: '#schedule' },
    { name: 'Pengumuman', href: '#announcement' },
  ];

  const location = useLocation();

  const handleNavClick = (e, href) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const offset = 80; // Offset for fixed navbar
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else if (location.pathname !== '/') {
        // If not on home page, navigate to home with hash
        window.location.href = '/' + href;
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-primary-800/95 backdrop-blur-md py-3 shadow-xl' : 'bg-transparent py-5'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform p-1">
            <img
              src="/images/logo mts.jpg"
              alt="Logo MTsN 3 Sanggau"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase">
            MTsN 3 Sanggau
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-bold text-emerald-50/70 hover:text-white transition-all uppercase tracking-widest"
            >
              {link.name}
            </Link>
          ))}
          <div className="h-6 w-px bg-white/20 mx-2"></div>
          <Link to="/login" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/20 transition-all active:scale-95">
            LOGIN
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden absolute top-full left-0 right-0 bg-primary-800/98 backdrop-blur-xl border-b border-white/10 transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-screen opacity-100 py-10 shadow-2xl' : 'max-h-0 opacity-0 py-0'
        }`}>
        <div className="flex flex-col gap-6 px-10 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-2xl font-black text-emerald-50 hover:text-white transition-all"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="bg-primary-500 text-white w-full py-5 rounded-2xl font-black text-xl shadow-xl mt-4"
          >
            LOGIN
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
