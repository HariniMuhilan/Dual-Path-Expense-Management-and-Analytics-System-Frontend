import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import api from '../api/axios';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

const Categories = () => {
  const { mode } = useMode();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [mode]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/categories?type=${mode}`);
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await api.post('/api/categories', {
        name: newCategory.trim(),
        type: mode,
        isDefault: false,
        isActive: true
      });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category. Default categories cannot be deleted.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Manage Categories ({mode})</h2>
          <p className="text-sm text-gray-500 mt-1">Add or remove custom categories for your {mode.toLowerCase()} expenses.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 flex items-center font-medium transition-colors"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Category
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700">{category.name}</span>
                    {category.default && (
                      <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={category.default}
                    className={`p-2 rounded-md transition-colors ${
                      category.default 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                    }`}
                    title={category.default ? "Default categories cannot be deleted" : "Delete category"}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No categories found. Add one above!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
