import { ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkTokenExpiration } from '../utils/auth';
import './styles.css';
import { FaUserCircle } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

const NavItem = ({ title, href }) => {
  return (
    <div className="relative group w-full lg:w-auto">
      <Link 
        to={href}
        className="flex items-center justify-between px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
      >
        <span>{title}</span>
      </Link>
    </div>
  );
};

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isValidSession = checkTokenExpiration();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Updated navigation items
  const navItems = [
    {
      title: 'Course',
      href: '/course',
    },
    {
      title: 'Blogs',
      href: '/blog',
    },
    {
      title: 'About Us',
      href: '/contact',
    },
    {
      title: 'Pricing',
      href: '/pricing',
    },
  ];

  return (
    <nav className="navbar sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container flex items-center justify-between px-4 py-2 mx-auto">
        <Link to="/" className="flex items-center gap-5">
          <img 
            src="https://res.cloudinary.com/dqt4zammn/image/upload/v1741619811/TDC_UPD_LOGO-removebg-preview_yksibf.png" 
            alt="TDC Logo" 
            className="h-10 brightness-110 rounded-lg"
          />
        </Link>

        {/* Hamburger Menu Button - Only visible on mobile */}
        <button
          className="lg:hidden text-gray-700 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {!isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>

        {/* Navigation Items */}
        <div className={`
          flex items-center space-x-2
          lg:relative lg:flex lg:flex-row
          absolute top-full left-0 right-0
          bg-white 
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'flex flex-col items-start p-4' : 'hidden lg:flex'}
          lg:bg-transparent lg:p-0
          ${isMobileMenuOpen ? 'border-t border-gray-200' : ''}
        `}> 
          {navItems.map((item, index) => (
            <div key={index} className="w-full lg:w-auto">
              <NavItem {...item} />
            </div>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className={`
          btn-ls flex items-center gap-4
          lg:relative lg:flex
          ${isMobileMenuOpen ? 'absolute top-full left-0 right-0 p-4 bg-white border-t border-gray-200' : 'relative'}
          ${isMobileMenuOpen ? 'flex-col items-start' : 'flex-row items-center'}
          lg:flex-row lg:bg-transparent lg:p-0 lg:border-0
        `}>
          {isValidSession && user ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
                >
                  <FaUserCircle className="w-6 h-6" />
                </button>
                
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Learning Dashboard
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-[#ffde58] rounded-md hover:bg-[#ffd025] transition-all duration-300 shadow-md"
              >
                Sign up
              </Link>
            </>
          )}
          {isValidSession && user?.isAdmin && (
            <Link
              to="/admin/users"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
