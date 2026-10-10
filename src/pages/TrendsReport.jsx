import React, { useState, useEffect, useMemo } from 'react';
import { useMode } from '../context/ModeContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Calendar, TrendingUp, DollarSign, BarChart3, 
  PieChart as PieIcon, Download, Printer, RefreshCw, 
  Sparkles, Layers, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const PALETTE = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', 
  '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#6366f1'
];

const TrendsReport = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';

  const [preset, setPreset] = useState('6M');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [categorySummaries, setCategorySummaries] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);

  const computeDates = (p) => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];
    const startDate = new Date();

    switch (p) {
      case '1M':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case '2Y':
        startDate.setFullYear(today.getFullYear() - 2);
        break;
      case '3Y':
        startDate.setFullYear(today.getFullYear() - 3);
        break;
      case 'custom':
        return { start: customStart, end: customEnd };
      default:
        startDate.setMonth(today.getMonth() - 6);
    }
    return { start: startDate.toISOString().split('T')[0], end: endStr };
  };

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const { start, end } = computeDates(preset);

      const [rangeRes, timeSeriesRes] = await Promise.all([
        api.get(`/api/analytics/range?startDate=${start}&endDate=${end}&mode=${mode}`),
        api.get(`/api/analytics/timeseries?startDate=${start}&endDate=${end}&mode=${mode}`)
      ]);

      setCategorySummaries(rangeRes.data);
      setTimeSeriesData(timeSeriesRes.data);
    } catch (err) {
      toast.error('Failed to load trends data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [mode, preset, customStart, customEnd]);

  const totalSpend = useMemo(() => {
    return categorySummaries.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  }, [categorySummaries]);

  const handleSeed = async () => {
    try {
      const res = await api.post('/api/expenses/seed-demo');
      toast.success(res.data.message || 'Demo data loaded');
      fetchTrends();
    } catch (err) {
      toast.error('Failed to seed demo data');
    }
  };

  const exportCSV = () => {
    if (categorySummaries.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Category', 'Total Amount (INR)', 'Share (%)'];
    const rows = categorySummaries.map((cat) => [
      `"${cat.categoryName}"`,
      cat.totalAmount.toFixed(2),
      totalSpend > 0 ? ((cat.totalAmount / totalSpend) * 100).toFixed(2) : '0'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Trends_Report_${mode}_${preset}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded');
  };

  return (
    <div className="space-y-7 pb-12 animate-fade-in-up">
      {/* Top Banner */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Multi-Period Trends</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHousehold ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {mode} INTELLIGENCE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Analyze category expenditures and spending trajectories across 1M, 3M, 6M, 1Y, 2Y, and 3Y windows.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSeed}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seed Sample Data</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Preset Duration Filter Bar */}
      <div className="glass-card p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Time Horizon:
          </span>
          {[
            { id: '1M', label: '1 Month' },
            { id: '3M', label: '3 Months' },
            { id: '6M', label: '6 Months' },
            { id: '1Y', label: '1 Year' },
            { id: '2Y', label: '2 Years' },
            { id: '3Y', label: '3 Years' },
            { id: 'custom', label: 'Custom' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPreset(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === btn.id
                  ? isHousehold
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <span className="text-slate-400 text-xs font-medium">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
            />
            <button
              onClick={fetchTrends}
              className="p-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Horizon Outflow</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{preset} duration selected</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Spending Category</p>
          <h3 className="text-xl font-bold text-slate-900 mt-1 truncate">
            {categorySummaries[0]?.categoryName || 'None'}
          </h3>
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            {categorySummaries[0] && totalSpend > 0 
              ? `₹${categorySummaries[0].totalAmount.toLocaleString()} (${((categorySummaries[0].totalAmount / totalSpend) * 100).toFixed(1)}%)`
              : 'No expenses'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Taxonomy Count</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{categorySummaries.length} Categories</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Categories with transactions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <>
          {/* Spending Progression Area Chart */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Spending Progression Over Time</h3>
                <p className="text-xs text-slate-500">Monthly aggregate trends across the selected duration</p>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {timeSeriesData.length} Months Tracked
              </span>
            </div>

            {timeSeriesData.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spendGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isHousehold ? '#4f46e5' : '#0d9488'} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={isHousehold ? '#4f46e5' : '#0d9488'} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="periodLabel"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Spend']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalAmount"
                      stroke={isHousehold ? '#4f46e5' : '#0d9488'}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#spendGradient2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">
                No timeline data available for this duration.
              </div>
            )}
          </div>

          {/* Distribution & Ranked Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Share Distribution</h3>
                <p className="text-xs text-slate-500 mb-4">Percentage allocation by category</p>
              </div>

              {categorySummaries.length > 0 ? (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySummaries}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="totalAmount"
                        nameKey="categoryName"
                      >
                        {categorySummaries.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                  No category distribution available.
                </div>
              )}
            </div>

            {/* Ranked Bar Chart */}
            <div className="glass-card p-6 rounded-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Highest Spending Categories</h3>
                <p className="text-xs text-slate-500 mb-4">Ranked expense driver breakdown</p>
              </div>

              {categorySummaries.length > 0 ? (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categorySummaries.slice(0, 8)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="categoryName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
                        width={90}
                      />
                      <Tooltip
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Spent']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="totalAmount" radius={[0, 6, 6, 0]}>
                        {categorySummaries.slice(0, 8).map((_, index) => (
                          <Cell key={`bar-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                  No categories to display.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Category Breakdown Table */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Detailed Category Breakdown</h3>
                <p className="text-xs text-slate-500">Aggregate metrics and budget percentages</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Grand Total: ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="py-3.5 px-6">Rank & Category</th>
                    <th className="py-3.5 px-6">Total Amount (₹)</th>
                    <th className="py-3.5 px-6">Share of Budget</th>
                    <th className="py-3.5 px-6">Visual Proportion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {categorySummaries.map((cat, idx) => {
                    const pct = totalSpend > 0 ? (cat.totalAmount / totalSpend) * 100 : 0;
                    return (
                      <tr key={cat.categoryName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold">
                            #{idx + 1}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                          />
                          {cat.categoryName}
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">
                          ₹{cat.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-6 font-medium text-slate-600">{pct.toFixed(1)}%</td>
                        <td className="py-3.5 px-6">
                          <div className="w-full max-w-[200px] bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: PALETTE[idx % PALETTE.length]
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrendsReport;
