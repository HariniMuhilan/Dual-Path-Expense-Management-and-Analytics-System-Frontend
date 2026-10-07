import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

const Dashboard = () => {
  const { mode } = useMode();
  const [loading, setLoading] = useState(true);
  
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [mode]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      // Fetch weekly and monthly data in parallel
      const [weeklyRes, monthlyRes] = await Promise.all([
        api.get(`/api/analytics/weekly?mode=${mode}`),
        api.get(`/api/analytics/monthly?year=${currentYear}&month=${currentMonth}&mode=${mode}`)
      ]);

      const weekly = weeklyRes.data.map(item => ({
        name: item.categoryName,
        value: item.totalAmount
      }));

      const monthly = monthlyRes.data.map(item => ({
        name: item.categoryName,
        value: item.totalAmount
      }));

      const totalMonthly = monthly.reduce((sum, item) => sum + item.value, 0);

      setWeeklyData(weekly);
      setMonthlyData(monthly);
      setMonthlyTotal(totalMonthly);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
          <p className="font-semibold text-gray-700">{payload[0].name}</p>
          <p className="text-blue-600">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your {mode.toLowerCase()} expenses.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className={`p-4 rounded-full ${mode === 'HOUSEHOLD' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spent This Month</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">₹{monthlyTotal.toFixed(2)}</h3>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 rounded-full bg-blue-100 text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Categories (Month)</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">{monthlyData.length}</h3>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 rounded-full bg-green-100 text-green-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Categories (Week)</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-800">{weeklyData.length}</h3>
            )}
          </div>
        </div>
      </div>

      {/* Charts Area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          {/* Pie Chart: Monthly Expense Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-6">Monthly Distribution</h3>
            {monthlyData.length > 0 ? (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthlyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400">
                No expense data for this month.
              </div>
            )}
          </div>

          {/* Bar Chart: Weekly Spending Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-6">Last 7 Days Spending by Category</h3>
            {weeklyData.length > 0 ? (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400">
                No expense data for the last 7 days.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
