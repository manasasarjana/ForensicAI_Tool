import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, Search, CheckCircle, ShieldAlert, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'Analysis Complete', message: 'Report CF-124 is ready for review.', time: '2m ago', unread: true, icon: FileText, color: 'text-blue-400', href: '/reports' },
    { id: 2, title: 'Hash Verified', message: 'Evidence drive_img.dd integrity confirmed.', time: '1h ago', unread: true, icon: CheckCircle, color: 'text-green-400', href: '/evidence' },
    { id: 3, title: 'System Warning', message: 'Failed login attempt from unknown IP.', time: '2h ago', unread: false, icon: ShieldAlert, color: 'text-yellow-400', href: '/audit' },
  ];

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-700 mr-2"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dark-400" />
            </div>
            <input
              type="text"
              placeholder="Search cases, evidence, reports..."
              className="input-field pl-12 pr-4 py-2 w-96 rounded-lg bg-dark-800 border border-dark-600 focus:ring-2 focus:ring-primary-500 text-dark-100 placeholder-dark-400 transition-all font-medium"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-dark-400 hover:text-dark-100 hover:bg-dark-700 relative focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-dark-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-dark-600 z-50 overflow-hidden text-left origin-top-right transition-all">
                <div className="flex justify-between items-center px-4 py-3 border-b border-dark-700 bg-dark-900/50">
                  <h3 className="text-sm font-semibold text-dark-100">Recent Alerts</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-dark-400 hover:text-dark-100 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(notif.href);
                        }}
                        className={`p-4 border-b border-dark-700 hover:bg-dark-700 transition-colors cursor-pointer flex items-start gap-3 ${notif.unread ? 'bg-primary-900/10' : ''}`}
                      >
                        <div className={`mt-0.5 rounded-full p-2 bg-dark-900 border border-dark-600 shadow-sm ${notif.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark-100 truncate">{notif.title}</p>
                          <p className="text-xs text-dark-300 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-dark-500 mt-1 font-mono">{notif.time}</p>
                        </div>
                        {notif.unread && <div className="h-2 w-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
                      </div>
                    );
                  })}
                </div>
                <div
                  className="p-3 text-center border-t border-dark-700 bg-dark-900/30 hover:bg-dark-800 transition-colors cursor-pointer"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/audit');
                  }}
                >
                  <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">View All Activity Logs</button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="hidden md:block text-right mr-3">
              <p className="text-sm font-medium text-dark-100">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium text-dark-100">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;