import React, { useState, useEffect, useMemo } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { 
  Trash2, Plus, Tag, Lock, Search, Sparkles, 
  Layers, CheckCircle, Shield, FolderPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = [
  'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 
  'bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-teal-500', 'bg-rose-500'
];

const Categories = () => {
  const { mode } = useMode();
  const isHousehold = mode === 'HOUSEHOLD';
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [mode]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/categories?type=${mode}`);
      setCategories(response.data);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setSubmitting(true);
      await api.post('/api/categories', {
        name: newCategory.trim(),
        type: mode,
        isDefault: false,
        isActive: true
      });
      setNewCategory('');
      fetchCategories();
      toast.success('Category added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
      toast.success(`Category "${name}" deleted!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const defaultCount = categories.filter(c => c.default).length;
  const customCount = categories.length - defaultCount;

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-fade-in-up">
      {/* Header Banner */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Category Architecture</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isHousehold ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {mode} MODE
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure default and custom spending categories for your {mode.toLowerCase()} workspace.
          </p>
        </div>

        {/* Stats chips */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
            <span className="text-base font-bold text-slate-800">{categories.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Defaults</span>
            <span className="text-base font-bold text-indigo-600">{defaultCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom</span>
            <span className="text-base font-bold text-emerald-600">{customCount}</span>
          </div>
        </div>
      </div>

      {/* Add Category Form Card */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <FolderPlus className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Create Custom Category</h2>
        </div>

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Pet Care, Solar Energy, Cloud Hosting..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newCategory.trim()}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ${
              submitting || !newCategory.trim()
                ? 'bg-indigo-400 cursor-not-allowed'
                : isHousehold 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </form>
      </div>

      {/* Categories Grid Container */}
      <div className="glass-card rounded-3xl overflow-hidden p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-bold text-slate-900">
              Active Taxonomy ({filteredCategories.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCategories.map((cat, idx) => (
              <div
                key={cat.id}
                className="p-4 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                  }`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{cat.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {cat.default ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                          <Lock className="w-2.5 h-2.5" />
                          Default System
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  {cat.default ? (
                    <span 
                      className="p-2 text-slate-300 cursor-not-allowed" 
                      title="Default system categories cannot be deleted"
                    >
                      <Lock className="w-4 h-4" />
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-90"
                      title="Delete custom category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-sm">
                No categories matching "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
