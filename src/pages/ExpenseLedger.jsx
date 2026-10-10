import React, { useState, useEffect, useMemo } from 'react';
import { useMode } from '../context/ModeContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Receipt, PlusCircle, Trash2, Search, Filter, 
  Download, ArrowUpDown, Calendar, DollarSign, Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExpenseLedger = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchExpenses();
  }, [mode]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/expenses/filter?mode=${mode}`);
      setExpenses(res.data);
    } catch (err) {
      toast.error('Failed to load expense ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id, desc) => {
    if (!window.confirm(`Delete expense "${desc || 'Untitled'}"?`)) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense removed from ledger');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesCat = categoryFilter === 'ALL' || exp.category?.name === categoryFilter;
      const matchesSearch = !searchQuery || 
        exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.expenseDate?.includes(searchQuery);
      return matchesCat && matchesSearch;
    });
  }, [expenses, categoryFilter, searchQuery]);

  const totalSum = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  const categoryNames = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category?.name).filter(Boolean)));
  }, [expenses]);

  const exportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    const headers = ['Date', 'Category', 'Description', 'Amount (INR)'];
    const rows = filteredExpenses.map(e => [
      e.expenseDate,
      `"${e.category?.name || 'Uncategorized'}"`,
      `"${e.description || ''}"`,
      e.amount.toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Ledger_${mode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Ledger exported as CSV');
  };

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Transaction Ledger</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHousehold ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {mode} ARCHIVE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete itemized record of all expenditures logged in {mode.toLowerCase()} mode.
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
          <Link
            to="/expenses/new"
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all active:scale-95 ${
              isHousehold 
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200' 
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Expense</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtered Spend Total</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ₹{totalSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-1">From {filteredExpenses.length} entries</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ledger Entries</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{expenses.length}</h3>
          <p className="text-xs text-indigo-600 font-semibold mt-1">Across all categories</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Ticket Size</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            ₹{filteredExpenses.length > 0 ? (totalSum / filteredExpenses.length).toFixed(0) : '0'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Per transaction average</p>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="glass-card rounded-3xl overflow-hidden p-6 space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">
              Transactions ({filteredExpenses.length})
            </h3>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search description, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categoryNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 text-xs rounded-md font-semibold ${
                        isHousehold 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {exp.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-700 max-w-[280px] truncate">
                      {exp.description || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-slate-900 whitespace-nowrap">
                      ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.description)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-90"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400 text-sm">
                      No matching transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseLedger;
