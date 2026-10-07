import React from 'react';
import { useMode } from '../context/ModeContext';

const Dashboard = () => {
  const { mode } = useMode();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="mt-4 text-gray-600">Current Mode: <span className="font-semibold text-blue-600">{mode}</span></p>
      {/* Visualizations will go here */}
    </div>
  );
};

export default Dashboard;
