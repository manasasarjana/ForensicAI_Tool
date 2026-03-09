import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  FolderOpen,
  FileText,
  Upload,
  BarChart3,
  Shield,
  User,
  LogOut,
  X,
  ShieldAlert
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const investigatorNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Cases', href: '/cases', icon: FolderOpen },
    { name: 'Evidence', href: '/evidence', icon: Upload },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Audit Logs', href: '/audit', icon: Shield },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const adminNavigation = [
    { name: 'Admin Workspace', href: '/admin', icon: ShieldAlert },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : investigatorNavigation;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-dark-800 border-r border-dark-700 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center flex-shrink-0 p-4 mx-4 my-4 bg-dark-900 rounded-xl border border-dark-600 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-primary-500/50 transition-colors z-50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-dark-900"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl group-hover:bg-primary-500/30 transition-all duration-700"></div>
              <Shield className="h-10 w-10 text-primary-400 drop-shadow-md relative z-10 transform group-hover:scale-110 transition-transform duration-500" />
              <div className="ml-3 flex flex-col relative z-10 mt-1">
                <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-dark-200 uppercase leading-none">
                  NEXUS
                </span>
                <span className="text-[0.65rem] font-bold tracking-[0.3em] text-primary-400 uppercase mt-1 pl-1">
                  Forensic AI
                </span>
              </div>
            </Link>

            {/* User info */}
            <div className="mt-6 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-dark-100">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-dark-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href ||
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout button */}
            <div className="px-2 pb-2">
              <button
                onClick={handleLogout}
                className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-700 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-dark-700">
            <Link to="/" onClick={onClose} className="flex items-center cursor-pointer z-50">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-dark-100">ForensicsAI</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-dark-100">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-dark-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="px-2 pb-4">
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;