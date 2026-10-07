import React from 'react';
import { useMode } from '../context/ModeContext';

const Categories = () => {
  const { mode } = useMode();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Category Settings</h1>
      <p className="mt-4 text-gray-600">Manage categories for <span className="font-semibold text-blue-600">{mode}</span> mode.</p>
      {/* Category settings list goes here */}
    </div>
  );
};

export default Categories;
