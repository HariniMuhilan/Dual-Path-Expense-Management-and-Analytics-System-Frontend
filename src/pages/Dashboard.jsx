import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  DollarSign, TrendingUp, Calendar, ArrowRight, 
  Sparkles, Wallet, PieChart as PieIcon, BarChart2, 
  Activity, ArrowUpRight, Plus, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const PALETTE = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', 
  '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#a855f7'
];

const Dashboard = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';
  const [loading, setLoading] = useState(true);
  
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [mode]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      const [weeklyRes, monthlyRes, recentRes] = await Promise.all([
        api.get(`/api/analytics/weekly?mode=${mode}`),
        api.get(`/api/analytics/monthly?year=${currentYear}&month=${currentMonth}&mode=${mode}`),
        api.get(`/api/expenses/filter?mode=${mode}`)
      ]);

      const weekly = weeklyRes.data.map(item => ({
        name: item.categoryName,
        value: item.totalAmount
      }));

      const monthly = monthlyRes.data.map(item => ({
        name: item.categoryName,
        value: item.totalAmount
      })).sort((a, b) => b.value - a.value);

      const totalMonthly = monthly.reduce((sum, item) => sum + item.value, 0);

      setWeeklyData(weekly);
      setMonthlyData(monthly);
      setMonthlyTotal(totalMonthly);
      setRecentTransactions(recentRes.data.slice(0, 5));
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md">
          <p className="font-semibold text-xs text-slate-300">{payload[0].name}</p>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const dailyAverage = currentDay > 0 ? (monthlyTotal / currentDay) : 0;

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Hero Financial Banner */}
      <div className={`p-7 rounded-3xl text-white shadow-xl relative overflow-hidden transition-all duration-500 ${
        isHousehold
          ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-900/40'
          : 'bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border border-emerald-900/40'
      }`}>
        {/* Ambient background blur elements */}
        <div className={`absolute -right-16 -top-16 w-72 h-72 rounded-full blur-3xl opacity-30 ${
          isHousehold ? 'bg-indigo-500' : 'bg-emerald-500'
        }`} />
        <div className={`absolute -left-12 -bottom-12 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          isHousehold ? 'bg-violet-600' : 'bg-teal-600'
        }`} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{mode} Cash Flow Overview</span>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Month-To-Date Spend</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display">
                ₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 font-medium border border-white/10">
                {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/reports"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-sm"
            >
              <span>Explore Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/expenses"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-95 ${
                isHousehold 
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </Link>
          </div>
        </div>

        {/* Mini stats row inside hero */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Daily Burn Rate</span>
            <p className="text-base font-bold text-white mt-0.5">₹{dailyAverage.toFixed(0)}/day</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Top Category</span>
            <p className="text-base font-bold text-white mt-0.5 truncate">
              {monthlyData[0]?.name || 'None'}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Active Categories</span>
            <p className="text-base font-bold text-white mt-0.5">{monthlyData.length} Types</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium">7-Day Outflow</span>
            <p className="text-base font-bold text-white mt-0.5">
              ₹{weeklyData.reduce((s, x) => s + x.value, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Month Budget Outflow</p>
            {loading ? (
              <div className="h-7 w-28 bg-slate-200 animate-pulse rounded-md mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
            )}
            <p className="text-xs text-slate-400 mt-1">Current Billing Cycle</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isHousehold ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Month Category</p>
            {loading ? (
              <div className="h-7 w-24 bg-slate-200 animate-pulse rounded-md mt-1" />
            ) : (
              <h3 className="text-xl font-bold text-slate-900 mt-1 truncate max-w-[160px]">
                {monthlyData[0]?.name || 'N/A'}
              </h3>
            )}
            <p className="text-xs text-indigo-600 font-semibold mt-1">
              {monthlyData[0] ? `₹${monthlyData[0].value.toLocaleString()} (${((monthlyData[0].value / (monthlyTotal || 1)) * 100).toFixed(0)}%)` : 'No spend'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PieIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">7-Day Transaction Vol.</p>
            {loading ? (
              <div className="h-7 w-16 bg-slate-200 animate-pulse rounded-md mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{weeklyData.length} Categories</h3>
            )}
            <p className="text-xs text-emerald-600 font-semibold mt-1">Recorded in last 7 days</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      {loading ? (
        <div className="flex justify-center py-20 bg-white/70 rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Distribution Donut Chart */}
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Spending Distribution</h3>
                <p className="text-xs text-slate-500">Breakdown of current month by category</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {monthlyData.length} Categories
              </span>
            </div>

            {monthlyData.length > 0 ? (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthlyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                No expense data for this month.
              </div>
            )}
          </div>

          {/* Last 7 Days Spending Bar Chart */}
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Last 7 Days Velocity</h3>
                <p className="text-xs text-slate-500">Expenditure per active category</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Velocity
              </span>
            </div>

            {weeklyData.length > 0 ? (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                No expense activity recorded in the last 7 days.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity Table Preview */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Latest recorded items in {mode.toLowerCase()} mode</p>
          </div>
          <Link
            to="/expenses"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 text-xs text-slate-500 font-medium">{tx.expenseDate}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">
                    <span className="inline-block px-2.5 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-md font-medium">
                      {tx.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-slate-700">{tx.description || '—'}</td>
                  <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                    ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
