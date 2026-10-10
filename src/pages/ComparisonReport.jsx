import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  ArrowLeftRight, RefreshCw, ArrowUpRight, ArrowDownRight, 
  Calendar, Layers, Sparkles, Download, Printer, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';

const ComparisonReport = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';

  const [preset, setPreset] = useState('month');
  const [period1Start, setPeriod1Start] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [period1End, setPeriod1End] = useState(() => {
    const d = new Date();
    d.setDate(0);
    return d.toISOString().split('T')[0];
  });
  const [period2Start, setPeriod2Start] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [period2End, setPeriod2End] = useState(() => new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const applyPreset = (p) => {
    setPreset(p);
    const today = new Date();

    if (p === 'month') {
      const p1S = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const p1E = new Date(today.getFullYear(), today.getMonth(), 0);
      const p2S = new Date(today.getFullYear(), today.getMonth(), 1);
      const p2E = today;
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p1E.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(p2E.toISOString().split('T')[0]);
    } else if (p === 'quarter') {
      const p2S = new Date();
      p2S.setMonth(today.getMonth() - 3);
      const p1S = new Date();
      p1S.setMonth(today.getMonth() - 6);
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p2S.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(today.toISOString().split('T')[0]);
    } else if (p === 'half') {
      const p2S = new Date();
      p2S.setMonth(today.getMonth() - 6);
      const p1S = new Date();
      p1S.setMonth(today.getMonth() - 12);
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p2S.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(today.toISOString().split('T')[0]);
    } else if (p === 'year') {
      const p2S = new Date();
      p2S.setFullYear(today.getFullYear() - 1);
      const p1S = new Date();
      p1S.setFullYear(today.getFullYear() - 2);
      setPeriod1Start(p1S.toISOString().split('T')[0]);
      setPeriod1End(p2S.toISOString().split('T')[0]);
      setPeriod2Start(p2S.toISOString().split('T')[0]);
      setPeriod2End(today.toISOString().split('T')[0]);
    } else if (p === 'twoYears') {
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

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/analytics/compare?start1=${period1Start}&end1=${period1End}&start2=${period2Start}&end2=${period2End}&mode=${mode}`
      );
      setReport(res.data);
    } catch (err) {
      toast.error('Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [mode, period1Start, period1End, period2Start, period2End]);

  const exportCSV = () => {
    if (!report || !report.categoryComparisons) {
      toast.error('No comparison data to export');
      return;
    }
    const headers = ['Category', 'Period 1 Spend', 'Period 2 Spend', 'Difference', 'Percentage Change (%)', 'Status'];
    const rows = report.categoryComparisons.map((c) => [
      `"${c.categoryName}"`,
      c.amountPeriod1.toFixed(2),
      c.amountPeriod2.toFixed(2),
      c.difference.toFixed(2),
      c.percentageChange.toFixed(2),
      c.difference > 0 ? 'Increased' : c.difference < 0 ? 'Decreased' : 'Equal'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Period_Comparison_${mode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Comparison report exported');
  };

  return (
    <div className="space-y-7 pb-12 animate-fade-in-up">
      {/* Top Banner */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Period-Over-Period Comparison</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHousehold ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {mode} VARIANCE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Compare any two equivalent time horizons (Month vs Month, 3M vs 3M, 1Y vs 1Y) with category variance shifts.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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

      {/* Comparison Selector Card */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Preset Horizon:
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
                onClick={() => applyPreset(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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

          <button
            onClick={fetchComparison}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Comparison</span>
          </button>
        </div>

        {/* Dual Period Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100/90">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Period 1 (Baseline)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={period1Start}
                onChange={(e) => setPeriod1Start(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
              <span className="text-indigo-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={period1End}
                onChange={(e) => setPeriod1End(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-indigo-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100/90">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Period 2 (Comparison)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={period2Start}
                onChange={(e) => setPeriod2Start(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-emerald-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
              <span className="text-emerald-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={period2End}
                onChange={(e) => setPeriod2End(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-emerald-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div className="flex justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : report ? (
        <>
          {/* Comparative Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Period 1 Total</p>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ₹{report.period1?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {report.period1?.expenseCount} transactions logged
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Period 2 Total</p>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ₹{report.period2?.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {report.period2?.expenseCount} transactions logged
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Variance & Change</p>
              <div className="flex items-center gap-2 mt-2">
                <h3
                  className={`text-2xl font-bold ${
                    report.absoluteDifference > 0
                      ? 'text-rose-600'
                      : report.absoluteDifference < 0
                      ? 'text-emerald-600'
                      : 'text-slate-700'
                  }`}
                >
                  {report.absoluteDifference > 0 ? '+' : ''}
                  ₹{report.absoluteDifference?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    report.percentageChange > 0
                      ? 'bg-rose-100 text-rose-700'
                      : report.percentageChange < 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {report.percentageChange > 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {report.percentageChange?.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {report.absoluteDifference > 0 ? 'Increase in expenditure' : 'Decrease in expenditure'}
              </p>
            </div>
          </div>

          {/* Side-by-Side Grouped Bar Chart */}
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Side-by-Side Category Comparison</h3>
                <p className="text-xs text-slate-500">Visual comparison of Period 1 vs Period 2 per category</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
                  Period 1 ({report.period1?.startDate} to {report.period1?.endDate})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                  Period 2 ({report.period2?.startDate} to {report.period2?.endDate})
                </span>
              </div>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={report.categoryComparisons}
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
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="amountPeriod1" name="amountPeriod1" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="amountPeriod2" name="amountPeriod2" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Variance Table */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Variance Analysis</h3>
                <p className="text-xs text-slate-500">Rupee shift and percentage delta across categories</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Period 1 (₹)</th>
                    <th className="py-3.5 px-6">Period 2 (₹)</th>
                    <th className="py-3.5 px-6">Difference (₹)</th>
                    <th className="py-3.5 px-6">% Change</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {report.categoryComparisons?.map((row) => {
                    const isUp = row.difference > 0;
                    const isDown = row.difference < 0;
                    return (
                      <tr key={row.categoryName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6 font-semibold text-slate-900">{row.categoryName}</td>
                        <td className="py-3.5 px-6 font-medium text-slate-700">
                          ₹{row.amountPeriod1.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-6 font-medium text-slate-700">
                          ₹{row.amountPeriod2.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`py-3.5 px-6 font-semibold ${
                            isUp ? 'text-rose-600' : isDown ? 'text-emerald-600' : 'text-slate-500'
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
                                : 'bg-slate-100 text-slate-700'
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
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
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
      ) : null}
    </div>
  );
};

export default ComparisonReport;
