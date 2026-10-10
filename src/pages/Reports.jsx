import React, { useState, useEffect, useMemo } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { 
  Calendar, TrendingUp, TrendingDown, DollarSign, 
  BarChart3, PieChart as PieIcon, ArrowRight, ArrowUpRight, ArrowDownRight,
  Layers, Download, Printer, RefreshCw, Filter, Sparkles, 
  SlidersHorizontal, CheckCircle2, AlertCircle, ArrowLeftRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const CHART_PALETTE = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', 
  '#8b5cf6', '#3b82f6', '#14b8a6', '#f97316', '#6366f1'
];

const Reports = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';

  // Main navigation tab within Reports
  const [activeTab, setActiveTab] = useState('timeframe'); // 'timeframe' | 'comparison' | 'ledger'

  // --- TIMEFRAME TAB STATE ---
  const [timeframePreset, setTimeframePreset] = useState('6M'); // '1M' | '3M' | '6M' | '1Y' | '2Y' | '3Y' | 'custom'
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const [loadingTimeframe, setLoadingTimeframe] = useState(false);
  const [categorySummaries, setCategorySummaries] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [ledgerExpenses, setLedgerExpenses] = useState([]);

  // --- COMPARISON TAB STATE ---
  const [comparisonPreset, setComparisonPreset] = useState('month'); // 'month' | 'quarter' | 'half' | 'year' | 'twoYears' | 'custom'
  // Period 1
  const [period1Start, setPeriod1Start] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [period1End, setPeriod1End] = useState(() => {
    const d = new Date();
    d.setDate(0); // last day of prev month
    return d.toISOString().split('T')[0];
  });
  // Period 2
  const [period2Start, setPeriod2Start] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [period2End, setPeriod2End] = useState(() => new Date().toISOString().split('T')[0]);

  const [loadingComparison, setLoadingComparison] = useState(false);
  const [comparisonReport, setComparisonReport] = useState(null);

  // Filter for Transaction Ledger
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // ----------------------------------------------------------------------
  // Helper: Compute Start & End Date based on Preset
  // ----------------------------------------------------------------------
  const computeDatesForPreset = (preset) => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];
    const startDate = new Date();

    switch (preset) {
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

  // ----------------------------------------------------------------------
  // Fetch Timeframe Analytics Data
  // ----------------------------------------------------------------------
  const fetchTimeframeData = async () => {
    try {
      setLoadingTimeframe(true);
      const { start, end } = computeDatesForPreset(timeframePreset);

      const [rangeRes, timeSeriesRes, expensesRes] = await Promise.all([
        api.get(`/api/analytics/range?startDate=${start}&endDate=${end}&mode=${mode}`),
        api.get(`/api/analytics/timeseries?startDate=${start}&endDate=${end}&mode=${mode}`),
        api.get(`/api/expenses/filter?startDate=${start}&endDate=${end}&mode=${mode}`)
      ]);

      setCategorySummaries(rangeRes.data);
      setTimeSeriesData(timeSeriesRes.data);
      setLedgerExpenses(expensesRes.data);
    } catch (err) {
      toast.error('Failed to load timeframe analytics');
    } finally {
      setLoadingTimeframe(false);
    }
  };

  useEffect(() => {
    fetchTimeframeData();
  }, [mode, timeframePreset, customStart, customEnd]);

  // ----------------------------------------------------------------------
  // Set Preset for Comparison Tab
  // ----------------------------------------------------------------------
  const applyComparisonPreset = (preset) => {
    setComparisonPreset(preset);
    const today = new Date();

    if (preset === 'month') {
      // Prev Month vs Current Month
      const p1S = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const p1E = new Date(today.getFullYear(), today.getMonth(), 0);
      const p2S = new Date(today.getFullYear(), today.getMonth(), 1);
      const p2E = today;
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p1E.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(p2E.toISOString().split('T')[0]);
    } else if (preset === 'quarter') {
      // 3 Months vs Previous 3 Months
      const p2S = new Date();
      p2S.setMonth(today.getMonth() - 3);
      const p1S = new Date();
      p1S.setMonth(today.getMonth() - 6);
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p2S.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(today.toISOString().split('T')[0]);
    } else if (preset === 'half') {
      // 6 Months vs Previous 6 Months
      const p2S = new Date();
      p2S.setMonth(today.getMonth() - 6);
      const p1S = new Date();
      p1S.setMonth(today.getMonth() - 12);
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p2S.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(today.toISOString().split('T')[0]);
    } else if (preset === 'year') {
      // Last 1 Year vs Previous 1 Year
      const p2S = new Date();
      p2S.setFullYear(today.getFullYear() - 1);
      const p1S = new Date();
      p1S.setFullYear(today.getFullYear() - 2);
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p2S.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(today.toISOString().split('T')[0]);
    } else if (preset === 'twoYears') {
      // Last 2 Years vs Previous 2 Years
      const p2S = new Date();
      p2S.setFullYear(today.getFullYear() - 2);
      const p1S = new Date();
      p1S.setFullYear(today.getFullYear() - 4);
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p2S.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(today.toISOString().split('T')[0]);
    }
  };

  // ----------------------------------------------------------------------
  // Fetch Comparison Analytics Data
  // ----------------------------------------------------------------------
  const fetchComparisonData = async () => {
    try {
      setLoadingComparison(true);
      const res = await api.get(
        `/api/analytics/compare?start1=${period1Start}&end1=${period1End}&start2=${period2Start}&end2=${period2End}&mode=${mode}`
      );
      setComparisonReport(res.data);
    } catch (err) {
      toast.error('Failed to load comparison data');
    } finally {
      setLoadingComparison(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'comparison') {
      fetchComparisonData();
    }
  }, [mode, activeTab, period1Start, period1End, period2Start, period2End]);

  // Seed sample demo data helper
  const handleSeedDemoData = async () => {
    try {
      const res = await api.post('/api/expenses/seed-demo');
      toast.success(res.data.message || 'Demo data loaded successfully!');
      fetchTimeframeData();
      if (activeTab === 'comparison') fetchComparisonData();
    } catch (err) {
      toast.error('Failed to seed demo data');
    }
  };

  // Total amount for timeframe
  const totalTimeframeSpend = useMemo(() => {
    return categorySummaries.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  }, [categorySummaries]);

  // Export Timeframe Data as CSV
  const exportTimeframeCSV = () => {
    if (categorySummaries.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Category', 'Total Amount (INR)', 'Percentage of Spend (%)'];
    const rows = categorySummaries.map((cat) => [
      `"${cat.categoryName}"`,
      cat.totalAmount.toFixed(2),
      totalTimeframeSpend > 0 ? ((cat.totalAmount / totalTimeframeSpend) * 100).toFixed(2) : '0'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${mode}_${timeframePreset}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded as CSV');
  };

  // Filtered ledger expenses
  const filteredLedger = useMemo(() => {
    return ledgerExpenses.filter((exp) => {
      const matchesCat = ledgerCategoryFilter === 'ALL' || exp.category?.name === ledgerCategoryFilter;
      const matchesSearch =
        !ledgerSearch ||
        exp.description?.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        exp.category?.name?.toLowerCase().includes(ledgerSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [ledgerExpenses, ledgerCategoryFilter, ledgerSearch]);

  // Distinct category list for filter
  const categoryNames = useMemo(() => {
    return Array.from(new Set(ledgerExpenses.map((e) => e.category?.name).filter(Boolean)));
  }, [ledgerExpenses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                isHousehold ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {mode} Workspace
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Deep-dive into spending trends, period-over-period comparisons, and category allocations.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSeedDemoData}
            title="Populate 3-year historical demo transactions for rich visualizations"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Seed Sample Data
          </button>
          <button
            onClick={exportTimeframeCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-3 rounded-t-2xl shadow-sm">
        <button
          onClick={() => setActiveTab('timeframe')}
          className={`flex items-center gap-2 pb-3.5 px-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'timeframe'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Timeframe & Category Breakdown
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 pb-3.5 px-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'comparison'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Period Comparison (Side-by-Side)
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 pb-3.5 px-4 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'ledger'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Itemized Transactions ({filteredLedger.length})
        </button>
      </div>

      {/* ========================================================================================= */}
      {/* TAB 1: TIMEFRAME & CATEGORY BREAKDOWN                                                     */}
      {/* ========================================================================================= */}
      {activeTab === 'timeframe' && (
        <div className="space-y-6">
          {/* Controls Bar: Time Duration Filters */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Duration:
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
                  onClick={() => setTimeframePreset(btn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    timeframePreset === btn.id
                      ? isHousehold
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-white shadow'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers if 'custom' is selected */}
            {timeframePreset === 'custom' && (
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={fetchTimeframeData}
                  className="p-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spending</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{totalTimeframeSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                <p className="text-xs text-gray-400 mt-1">{timeframePreset} window</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Spending Category</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  {categorySummaries[0]?.categoryName || 'None'}
                </h3>
                <p className="text-xs text-indigo-600 font-medium mt-1">
                  {categorySummaries[0] && totalTimeframeSpend > 0
                    ? `₹${categorySummaries[0].totalAmount.toLocaleString()} (${((categorySummaries[0].totalAmount / totalTimeframeSpend) * 100).toFixed(1)}%)`
                    : 'No expenses'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Categories</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{categorySummaries.length}</h3>
                <p className="text-xs text-gray-400 mt-1">With recorded activity</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <PieIcon className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transactions Count</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{ledgerExpenses.length}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Avg ₹{ledgerExpenses.length > 0 ? (totalTimeframeSpend / ledgerExpenses.length).toFixed(0) : '0'}/tx
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Visualizations Section */}
          {loadingTimeframe ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Row 1: Time-series expenditure progression */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Spending Progression Over Time</h3>
                    <p className="text-xs text-gray-500">Monthly aggregate trends across the selected duration</p>
                  </div>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-semibold">
                    {timeSeriesData.length} Months Tracked
                  </span>
                </div>

                {timeSeriesData.length > 0 ? (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isHousehold ? '#4f46e5' : '#1e293b'} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={isHousehold ? '#4f46e5' : '#1e293b'} stopOpacity={0.05} />
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
                          labelFormatter={(label) => `Month: ${label}`}
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="totalAmount"
                          stroke={isHousehold ? '#4f46e5' : '#1e293b'}
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#spendGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
                    No timeline data recorded for this duration.
                  </div>
                )}
              </div>

              {/* Row 2: Distribution & Ranked Bar Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart: Category Share */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Category Share Distribution</h3>
                    <p className="text-xs text-gray-500 mb-4">Percentage allocation by category</p>
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
                            {categorySummaries.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                      No category distribution available.
                    </div>
                  )}
                </div>

                {/* Ranked Category Spending Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Highest Spending Categories</h3>
                    <p className="text-xs text-gray-500 mb-4">Total amount spent per category ranking</p>
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
                            contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          />
                          <Bar dataKey="totalAmount" radius={[0, 6, 6, 0]}>
                            {categorySummaries.slice(0, 8).map((_, index) => (
                              <Cell key={`bar-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                      No categories to display.
                    </div>
                  )}
                </div>
              </div>

              {/* Data Table: Detailed Category Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Detailed Category Breakdown</h3>
                    <p className="text-xs text-gray-500">Itemized aggregate stats and budget proportions</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">
                    Grand Total: ₹{totalTimeframeSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <th className="py-3.5 px-6">Rank & Category</th>
                        <th className="py-3.5 px-6">Total Amount (₹)</th>
                        <th className="py-3.5 px-6">Share of Budget</th>
                        <th className="py-3.5 px-6">Visual Proportion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {categorySummaries.map((cat, idx) => {
                        const pct = totalTimeframeSpend > 0 ? (cat.totalAmount / totalTimeframeSpend) * 100 : 0;
                        return (
                          <tr key={cat.categoryName} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3.5 px-6 font-medium text-gray-900 flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs flex items-center justify-center font-bold">
                                #{idx + 1}
                              </span>
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }}
                              />
                              {cat.categoryName}
                            </td>
                            <td className="py-3.5 px-6 font-semibold text-gray-800">
                              ₹{cat.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-6 font-medium text-gray-600">{pct.toFixed(1)}%</td>
                            <td className="py-3.5 px-6">
                              <div className="w-full max-w-[200px] bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length]
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {categorySummaries.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                            No expense records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 2: PERIOD COMPARISON (SIDE-BY-SIDE ANALYSIS)                                          */}
      {/* ========================================================================================= */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Comparison Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
                  Preset Duration:
                </span>
                {[
                  { id: 'month', label: 'Month vs Month' },
                  { id: 'quarter', label: '3 Months vs 3 Months' },
                  { id: 'half', label: '6 Months vs 6 Months' },
                  { id: 'year', label: '1 Year vs 1 Year' },
                  { id: 'twoYears', label: '2 Years vs 2 Years' },
                  { id: 'custom', label: 'Custom Range' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => applyComparisonPreset(btn.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      comparisonPreset === btn.id
                        ? isHousehold
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800 text-white shadow'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchComparisonData}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors self-start lg:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Run Comparison
              </button>
            </div>

            {/* Date Pickers for Period 1 and Period 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100/80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Period 1 (Baseline Period)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={period1Start}
                    onChange={(e) => setPeriod1Start(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-indigo-400 text-xs font-semibold">to</span>
                  <input
                    type="date"
                    value={period1End}
                    onChange={(e) => setPeriod1End(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100/80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Period 2 (Comparison Period)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={period2Start}
                    onChange={(e) => setPeriod2Start(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-emerald-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-400 text-xs font-semibold">to</span>
                  <input
                    type="date"
                    value={period2End}
                    onChange={(e) => setPeriod2End(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-emerald-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comparison KPI Summary */}
          {loadingComparison ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : comparisonReport ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Period 1 Total</p>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    ₹{comparisonReport.period1?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {comparisonReport.period1?.expenseCount} transactions logged
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Period 2 Total</p>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">
                    ₹{comparisonReport.period2?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {comparisonReport.period2?.expenseCount} transactions logged
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Variance & Change</p>
                  <div className="flex items-center gap-2 mt-2">
                    <h3
                      className={`text-2xl font-bold ${
                        comparisonReport.absoluteDifference > 0
                          ? 'text-rose-600'
                          : comparisonReport.absoluteDifference < 0
                          ? 'text-emerald-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {comparisonReport.absoluteDifference > 0 ? '+' : ''}
                      ₹{comparisonReport.absoluteDifference?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        comparisonReport.percentageChange > 0
                          ? 'bg-rose-100 text-rose-700'
                          : comparisonReport.percentageChange < 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {comparisonReport.percentageChange > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {comparisonReport.percentageChange?.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {comparisonReport.absoluteDifference > 0 ? 'Increase in spending' : 'Decrease in spending'}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Grouped Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Side-by-Side Category Comparison</h3>
                    <p className="text-xs text-gray-500">Visual comparison of Period 1 vs Period 2 per category</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span>
                      Period 1 ({comparisonReport.period1?.startDate} - {comparisonReport.period1?.endDate})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                      Period 2 ({comparisonReport.period2?.startDate} - {comparisonReport.period2?.endDate})
                    </span>
                  </div>
                </div>

                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonReport.categoryComparisons}
                      margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="categoryName"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                      />
                      <Tooltip
                        formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name === 'amountPeriod1' ? 'Period 1' : 'Period 2']}
                        contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="amountPeriod1" name="amountPeriod1" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="amountPeriod2" name="amountPeriod2" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Variance & Shift Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Category Variance Analysis</h3>
                    <p className="text-xs text-gray-500">Dollar shift and percentage changes per category</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                        <th className="py-3.5 px-6">Category</th>
                        <th className="py-3.5 px-6">Period 1 (₹)</th>
                        <th className="py-3.5 px-6">Period 2 (₹)</th>
                        <th className="py-3.5 px-6">Difference (₹)</th>
                        <th className="py-3.5 px-6">% Change</th>
                        <th className="py-3.5 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {comparisonReport.categoryComparisons?.map((row) => {
                        const isUp = row.difference > 0;
                        const isDown = row.difference < 0;
                        return (
                          <tr key={row.categoryName} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3.5 px-6 font-semibold text-gray-900">{row.categoryName}</td>
                            <td className="py-3.5 px-6 font-medium text-gray-700">
                              ₹{row.amountPeriod1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-6 font-medium text-gray-700">
                              ₹{row.amountPeriod2.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td
                              className={`py-3.5 px-6 font-semibold ${
                                isUp ? 'text-rose-600' : isDown ? 'text-emerald-600' : 'text-gray-500'
                              }`}
                            >
                              {isUp ? '+' : ''}₹{row.difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-6">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isUp
                                    ? 'bg-rose-100 text-rose-700'
                                    : isDown
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {isUp && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                                {isDown && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                {row.percentageChange > 0 ? '+' : ''}
                                {row.percentageChange?.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3.5 px-6">
                              <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                                  isUp
                                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                    : isDown
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                                }`}
                              >
                                {isUp ? 'Increased Spend' : isDown ? 'Reduced Spend' : 'No Change'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              Select periods above and click "Run Comparison"
            </div>
          )}
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 3: ITEMIZED TRANSACTION LEDGER                                                        */}
      {/* ========================================================================================= */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Itemized Transaction Ledger</h3>
              <p className="text-xs text-gray-500">Every recorded transaction contributing to current period analytics</p>
            </div>

            {/* Filter and Search controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search description..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="pl-3 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={ledgerCategoryFilter}
                onChange={(e) => setLedgerCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                {categoryNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredLedger.slice(0, 100).map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-5 text-gray-500 text-xs font-medium">{exp.expenseDate}</td>
                    <td className="py-3 px-5 font-semibold text-gray-900">
                      <span className="inline-block px-2.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-md">
                        {exp.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-700 text-xs">{exp.description || '—'}</td>
                    <td className="py-3 px-5 text-right font-bold text-gray-900">
                      ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {filteredLedger.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                      No matching transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredLedger.length > 100 && (
            <p className="text-xs text-gray-400 text-center pt-2">
              Showing first 100 of {filteredLedger.length} transactions. Use search or export CSV for full list.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
