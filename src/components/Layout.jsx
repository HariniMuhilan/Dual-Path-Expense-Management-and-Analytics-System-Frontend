import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useMode } from '../context/ModeContext';
import { 
  Home, PlusCircle, Layers, BarChart3, ArrowLeftRight, 
  Settings, Sparkles, Building2, UserCircle2, ChevronRight, 
  Repeat, FolderTree, FileSpreadsheet
} from 'lucide-react';

const Layout = () => {
  const { mode, toggleMode, setMode } = useMode();
  const location = useLocation();
  const isHousehold = mode === 'HOUSEHOLD';

  // Navigation structure organized by sections and sub-topics
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Executive Dashboard', path: '/dashboard', icon: Home, badge: null }
      ]
    },
    {
      title: 'TRANSACTIONS',
      items: [
        { name: 'Record Expense', path: '/expenses/new', icon: PlusCircle, badge: 'NEW' },
        { name: 'Expense Ledger', path: '/expenses/ledger', icon: Layers, badge: null }
      ]
    },
    {
      title: 'ANALYTICS & REPORTS',
      items: [
        { name: 'Multi-Period Trends', path: '/reports/trends', icon: BarChart3, badge: null },
        { name: 'Period Comparison', path: '/reports/compare', icon: ArrowLeftRight, badge: 'PRO' }
      ]
    },
    {
      title: 'SETTINGS & TAXONOMY',
      items: [
        { name: 'Category Architecture', path: '/categories', icon: FolderTree, badge: null }
      ]
    }
  ];

  // Dynamic Page Meta
  const pageMeta = {
    '/dashboard': { section: 'OVERVIEW', title: 'Executive Overview', desc: 'Real-time financial pulse and spending distribution' },
    '/expenses/new': { section: 'TRANSACTIONS', title: 'Record Expense', desc: 'Capture single expenditure with category taxonomy' },
    '/expenses/ledger': { section: 'TRANSACTIONS', title: 'Transaction Ledger', desc: 'Complete historical record of logged expenditures' },
    '/reports/trends': { section: 'ANALYTICS & REPORTS', title: 'Multi-Period Trends', desc: '1M, 3M, 6M, 1Y, 2Y, 3Y category trajectories' },
    '/reports/compare': { section: 'ANALYTICS & REPORTS', title: 'Period Comparison', desc: 'Side-by-side period-over-period delta variance' },
    '/categories': { section: 'SETTINGS', title: 'Category Architecture', desc: 'Manage default presets and custom spending taxonomy' }
  };

  const currentPath = Object.keys(pageMeta).find(p => location.pathname === p) || 
                      Object.keys(pageMeta).find(p => location.pathname.startsWith(p)) || 
                      '/dashboard';
  const currentMeta = pageMeta[currentPath] || pageMeta['/dashboard'];

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${
      isHousehold ? 'ambient-mesh-household' : 'ambient-mesh-business'
    }`}>
      {/* Sidebar with Sub-Topics */}
      <aside className="w-72 flex flex-col justify-between bg-slate-950 text-slate-300 border-r border-slate-800/80 shadow-2xl relative z-40 select-none">
        <div className="overflow-y-auto flex-1 pb-4">
          {/* Brand Header */}
          <div className="p-6 pb-5 border-b border-slate-800/60 flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition-transform duration-300 hover:scale-105 ${
              isHousehold 
                ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-indigo-500/20' 
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20'
            }`}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight font-display">DualPath</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400 border border-slate-700">v2.0</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Expense & Wealth OS</p>
            </div>
          </div>

          {/* Active Workspace Selector */}
          <div className="px-5 pt-5 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
              Active Workspace
            </p>
            <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setMode('HOUSEHOLD')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isHousehold
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-900/40 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UserCircle2 className="w-3.5 h-3.5" />
                Household
              </button>
              <button
                onClick={() => setMode('BUSINESS')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  !isHousehold
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Business
              </button>
            </div>
          </div>

          {/* Sidebar Sections & Sub-Topics */}
          <nav className="mt-2 px-4 space-y-5">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                  {sec.title}
                </p>

                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || 
                      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? isHousehold
                              ? 'bg-indigo-600/15 text-white font-semibold border border-indigo-500/30'
                              : 'bg-emerald-600/15 text-white font-semibold border border-emerald-500/30'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`p-1 rounded-lg transition-colors ${
                            isActive 
                              ? isHousehold ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-slate-400 group-hover:text-white group-hover:bg-slate-800'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <span>{item.name}</span>
                        </div>

                        {item.badge ? (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isHousehold ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Workspace Switcher Card */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Current Mode</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isHousehold 
                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60' 
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isHousehold ? 'bg-indigo-400' : 'bg-emerald-400'
                }`} />
                {mode}
              </span>
            </div>

            <button
              onClick={toggleMode}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700/80 hover:text-white rounded-lg transition-all duration-200 border border-slate-700 active:scale-95"
            >
              <Repeat className="w-3.5 h-3.5" />
              Switch to {isHousehold ? 'Business' : 'Household'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Glassmorphic Top Navbar with Hierarchical Breadcrumb */}
        <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 flex items-center justify-between z-20 sticky top-0 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{currentMeta.section}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className={isHousehold ? 'text-indigo-600' : 'text-emerald-600'}>
                {currentMeta.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              {currentMeta.desc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Mode Indicator Pill */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isHousehold 
                ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80' 
                : 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isHousehold ? 'bg-indigo-600 animate-ping' : 'bg-emerald-600 animate-ping'
              }`} />
              {mode} ACTIVE
            </div>

            {/* Quick Action Button */}
            <Link
              to="/expenses/new"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                isHousehold 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Record Expense
            </Link>
          </div>
        </header>

        {/* Scrollable Dynamic Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 animate-fade-in-up">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
