import React from 'react';
import { useMode } from '../context/ModeContext';

const Expenses = () => {
  const { mode } = useMode();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Expenses Logging</h1>
      <p className="mt-4 text-gray-600">Log expenses for <span className="font-semibold text-blue-600">{mode}</span> mode.</p>
      {/* Expense logging form goes here */}
    </div>
  );
};

export default Expenses;
