import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { Home, ListPlus, Settings, PieChart, Repeat } from 'lucide-react';

const Layout = () => {
  const { mode, toggleMode } = useMode();
  const location = useLocation();

  const isHousehold = mode === 'HOUSEHOLD';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Expenses', path: '/expenses', icon: ListPlus },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Categories', path: '/categories', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`w-64 flex flex-col justify-between text-white transition-colors duration-300 ${isHousehold ? 'bg-indigo-700' : 'bg-slate-800'}`}>
        <div>
          <div className="p-6 text-2xl font-bold border-b border-white/20">
            {isHousehold ? 'Household' : 'Business'}
          </div>
          <nav className="mt-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-6 py-3 mt-2 hover:bg-white/10 transition-colors ${isActive ? 'bg-white/20 font-semibold border-l-4 border-white' : ''}`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Toggle Mode Button */}
        <div className="p-6 border-t border-white/20">
          <button
            onClick={toggleMode}
            className="flex items-center justify-center w-full px-4 py-2 font-medium text-white transition-colors bg-white/10 rounded-lg hover:bg-white/20"
          >
            <Repeat className="w-4 h-4 mr-2" />
            Switch to {isHousehold ? 'Business' : 'Household'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {location.pathname.split('/')[1] || 'Overview'}
            </h2>
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
