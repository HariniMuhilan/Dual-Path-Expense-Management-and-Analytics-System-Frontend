import React from 'react';
import { useMode } from '../context/ModeContext';

const Reports = () => {
  const { mode } = useMode();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
      <p className="mt-4 text-gray-600">View detailed reports for <span className="font-semibold text-blue-600">{mode}</span> mode.</p>
    </div>
  );
};

export default Reports;
