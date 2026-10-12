import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecordExpense from './pages/RecordExpense';
import ExpenseLedger from './pages/ExpenseLedger';
import TrendsReport from './pages/TrendsReport';
import ComparisonReport from './pages/ComparisonReport';
import Categories from './pages/Categories';

function App() {
  return (
    <AuthProvider>
      <ModeProvider>
        <Router>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                fontSize: '13px'
              }
            }} 
          />
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Application Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
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

            {/* Fallback to dashboard or login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ModeProvider>
    </AuthProvider>
  );
}

export default App;
