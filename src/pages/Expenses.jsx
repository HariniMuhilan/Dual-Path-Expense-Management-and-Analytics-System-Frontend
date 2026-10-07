import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { PlusCircle, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

const Expenses = () => {
  const { mode } = useMode();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: ''
  });

  // Calculate 2-year constraint for the date picker
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  const minDate = twoYearsAgo.toISOString().split('T')[0];

  useEffect(() => {
    fetchCategories();
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Receipt className="w-6 h-6 mr-2 text-blue-600" />
              Log Expense
            </h2>
            <p className="text-sm text-gray-500 mt-1">Record a new {mode.toLowerCase()} transaction.</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            mode === 'HOUSEHOLD' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
          }`}>
            {mode}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
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
                  className="pl-7 block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date (Within last 2 years)</label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                required
                className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">
                No categories found. Please add categories in Settings first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What was this for?"
              className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors
                ${loading || categories.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Save Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Expenses;
