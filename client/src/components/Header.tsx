import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiFileText, FiUsers, FiBarChart2, FiLogOut, FiActivity, FiUser, FiChevronDown, FiSettings } from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/invoices/create', label: 'New Invoice', icon: FiFileText },
  { path: '/customers', label: 'Customers', icon: FiUsers },
  { path: '/sales', label: 'Sales', icon: FiBarChart2 },
  { path: '/reports', label: 'Reports', icon: FiActivity },
];

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm no-print">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-primary-700 font-bold text-lg">
            <FiFileText className="text-2xl" />
            <span>Pharma ERP</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-gray-700 font-medium hidden sm:inline">
                {user?.name}
              </span>
              <FiChevronDown size={14} className="text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiUser size={16} />
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiSettings size={16} />
                  Company Settings
                </Link>
                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                >
                  <FiLogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
