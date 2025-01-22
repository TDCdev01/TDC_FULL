import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './Pages/Login';
import RegisterPage from './Pages/Register';
import Home from './Pages/Home';
import ContactUs from './Pages/ContactUs';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileSetup from './Pages/ProfileSetup';
import ForgotPassword from './components/ForgotPassword';

function AppContent() {
    return (
        <div className="w-full min-h-screen">
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfileSetup />
                    </ProtectedRoute>
                } />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default AppContent; 