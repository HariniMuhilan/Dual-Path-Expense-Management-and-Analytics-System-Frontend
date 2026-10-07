import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { mode } = useMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    fetchSummaryData();
  }, [mode]);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      // Fetch current month's data to calculate the total spent this month
      const response = await api.get(`/api/analytics/monthly?year=${today.getFullYear()}&month=${today.getMonth() + 1}&mode=${mode}`);
      
      const total = response.data.reduce((sum, item) => sum + item.totalAmount, 0);
      setMonthlyTotal(total);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your {mode.toLowerCase()} expenses.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center text-red-700 rounded-r-md">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent This Month */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className={`p-4 rounded-full ${mode === 'HOUSEHOLD' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spent This Month</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">${monthlyTotal.toFixed(2)}</h3>
            )}
          </div>
        </div>

        {/* Placeholder Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 rounded-full bg-blue-100 text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Weekly Trend</p>
            <h3 className="text-xl font-semibold text-gray-400 mt-1">Coming Soon</h3>
          </div>
        </div>

        {/* Placeholder Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 rounded-full bg-green-100 text-green-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Year to Date</p>
            <h3 className="text-xl font-semibold text-gray-400 mt-1">Coming Soon</h3>
          </div>
        </div>
      </div>

      {/* Charts Placeholder Area for Day 13 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-dashed">
          <p>Pie Chart Visualizations (Day 13)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-dashed">
          <p>Bar Chart Trends (Day 13)</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
