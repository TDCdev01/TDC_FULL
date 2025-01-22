import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/admin/AdminRoute';
import AdminLogin from './components/admin/AdminLogin';
import AppContent from './AppContent';
import BlogList from './Pages/BlogList';
import BlogDetail from './Pages/BlogDetail';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin/*" element={<AdminRoute />} />
                    
                    {/* Blog Routes */}
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    
                    {/* Other Routes */}
                    <Route path="/*" element={<AppContent />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
