import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RecordExpense from './pages/RecordExpense';
import ExpenseLedger from './pages/ExpenseLedger';
import TrendsReport from './pages/TrendsReport';
import ComparisonReport from './pages/ComparisonReport';
import Categories from './pages/Categories';

function App() {
  return (
    <ModeProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="expenses" element={<Navigate to="/expenses/ledger" replace />} />
            <Route path="expenses/new" element={<RecordExpense />} />
            <Route path="expenses/ledger" element={<ExpenseLedger />} />
            <Route path="reports" element={<Navigate to="/reports/trends" replace />} />
            <Route path="reports/trends" element={<TrendsReport />} />
            <Route path="reports/compare" element={<ComparisonReport />} />
            <Route path="categories" element={<Categories />} />
          </Route>
        </Routes>
      </Router>
    </ModeProvider>
  );
}

export default App;
