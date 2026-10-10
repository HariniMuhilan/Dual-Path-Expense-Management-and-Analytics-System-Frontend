import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { PlusCircle, Receipt, Trash2, Calendar, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Expenses = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';
  const [categories, setCategories] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRecent, setFetchingRecent] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: ''
  });

  // Calculate constraint for the date picker (supports up to 5 years back)
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);
  const minDate = fiveYearsAgo.toISOString().split('T')[0];

  useEffect(() => {
    fetchCategories();
    fetchRecentExpenses();
    // Reset form when mode changes
    setFormData(prev => ({ ...prev, categoryId: '' }));
  }, [mode]);

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/api/categories?type=${mode}`);
      setCategories(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: response.data[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchRecentExpenses = async () => {
    try {
      setFetchingRecent(true);
      const res = await api.get(`/api/expenses/filter?mode=${mode}`);
      setRecentExpenses(res.data.slice(0, 10)); // Show latest 10
    } catch (err) {
      // ignore or toast
    } finally {
      setFetchingRecent(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/expenses', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Expense logged successfully!');
      setFormData(prev => ({
        ...prev,
        amount: '',
        description: '',
      }));
      fetchRecentExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense deleted!');
      fetchRecentExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Receipt className="w-6 h-6 mr-2 text-indigo-600" />
              Log Expense
            </h2>
            <p className="text-sm text-gray-500 mt-1">Record a new {mode.toLowerCase()} transaction.</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isHousehold ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
          }`}>
            {mode} Mode
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm font-semibold">₹</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="pl-8 block w-full border border-gray-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date (Within last 5 years)</label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                required
                className="block w-full border border-gray-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-sm"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  No categories found. Please add categories in Categories tab first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description / Note</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What was this expense for?"
                className="block w-full border border-gray-300 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white transition-all
                ${loading || categories.length === 0 
                  ? 'bg-indigo-300 cursor-not-allowed' 
                  : isHousehold
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 shadow-indigo-100 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 shadow-slate-200 shadow-md'
                }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Record Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Logged Expenses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="text-base font-bold text-gray-900">Recent {mode} Expenses</h3>
          </div>
          <span className="text-xs text-gray-400">Showing last 10 entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6 text-right">Amount (₹)</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-6 text-gray-500 text-xs font-medium">{exp.expenseDate}</td>
                  <td className="py-3 px-6 font-semibold text-gray-900">
                    <span className="inline-block px-2.5 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-md font-medium">
                      {exp.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-gray-700 text-xs">{exp.description || '—'}</td>
                  <td className="py-3 px-6 text-right font-bold text-gray-900">
                    ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {recentExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                    No recent expenses recorded. Log one above!
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

export default Expenses;
