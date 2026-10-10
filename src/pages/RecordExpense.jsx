import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  PlusCircle, Receipt, ArrowRight, Sparkles, 
  Tag, Calendar, CheckCircle2, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const RecordExpense = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastLogged, setLastLogged] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: ''
  });

  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);
  const minDate = fiveYearsAgo.toISOString().split('T')[0];

  useEffect(() => {
    fetchCategories();
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
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      const res = await api.post('/api/expenses', payload);
      toast.success('Expense recorded successfully!');
      setLastLogged({
        amount: payload.amount,
        date: payload.expenseDate,
        description: payload.description,
        category: categories.find(c => c.id === parseInt(formData.categoryId))?.name || 'General'
      });
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
    <div className="max-w-2xl mx-auto space-y-7 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Record Expense</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHousehold ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {mode} MODE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Capture a new expense item with category taxonomy and date tracking.
          </p>
        </div>

        <Link
          to="/expenses/ledger"
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          <span>View All Ledger</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Focused Entry Card */}
      <div className="glass-card rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className={`p-2.5 rounded-2xl text-white ${
            isHousehold ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Transaction Details</h2>
            <p className="text-xs text-slate-400">Fill out required fields to post to the ledger</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Field with Big Bold Focus */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Amount (INR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold text-lg">₹</span>
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
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Expense Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              >
                <option value="" disabled>Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-600">
                  No categories found. Add categories in Settings first.
                </p>
              )}
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Transaction Date
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Description / Memo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Description / Memo
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Monthly electricity bill, Team lunch, Server hosting..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className={`w-full py-3.5 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                loading || categories.length === 0 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : isHousehold
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-900/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/20'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Confirm & Record Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation feedback card if an item was just logged */}
      {lastLogged && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">Last Transaction Posted</p>
              <p className="text-xs text-emerald-700">
                ₹{lastLogged.amount.toFixed(2)} in {lastLogged.category} on {lastLogged.date}
              </p>
            </div>
          </div>
          <Link
            to="/expenses/ledger"
            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>View Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecordExpense;
