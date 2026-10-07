import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Reports from './pages/Reports';

function App() {
  return (
    <ModeProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </Router>
    </ModeProvider>
  );
}

export default App;
