import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { 
  PlusCircle, Receipt, Trash2, Calendar, DollarSign, 
  Clock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Filter 
} from 'lucide-react';
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

  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);
  const minDate = fiveYearsAgo.toISOString().split('T')[0];

  useEffect(() => {
    fetchCategories();
    fetchRecentExpenses();
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
      setRecentExpenses(res.data.slice(0, 15));
    } catch (err) {
      // ignore
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
      toast.success('Expense recorded successfully!');
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
    if (!window.confirm('Delete this recorded expense?')) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense deleted!');
      fetchRecentExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const totalRecent = recentExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Top Banner */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Expense Ledger & Entry</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHousehold ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {mode} VAULT
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Log single expenditures and view recent {mode.toLowerCase()} activity in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent Activity Total</span>
            <span className="text-base font-bold text-slate-800">₹{totalRecent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Form on Left, Recent Stream on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Log Expense Form */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-3xl p-7 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className={`p-2 rounded-xl text-white ${
                isHousehold ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Transaction</h2>
                <p className="text-xs text-slate-400">Specify details below to log transaction</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Amount (INR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold text-base">₹</span>
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
                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Expense Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleChange}
                    min={minDate}
                    max={maxDate}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Description / Reference
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. AWS server cost, Grocery run, Rent transfer..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || categories.length === 0}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
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
                    <span>Save Transaction</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Recent Activity Stream Table */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Last 15 records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {exp.expenseDate}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 text-xs rounded-md font-semibold ${
                          isHousehold 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {exp.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 max-w-[180px] truncate">
                        {exp.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-90"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentExpenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No transactions logged yet. Use the form on the left!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
