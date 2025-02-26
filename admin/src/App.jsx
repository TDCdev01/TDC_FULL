import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './components/admin/AdminLogin';
import AdminRoute from './components/admin/AdminRoute';
import AdminRegister from './components/admin/AdminRegister';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/signup" element={<AdminRegister />} />
          
          {/* All protected routes are handled by AdminRoute */}
          <Route path="/*" element={<AdminRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;