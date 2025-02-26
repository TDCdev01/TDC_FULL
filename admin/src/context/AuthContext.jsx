import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        token: null,
        loading: true  // Add loading state
    });

    // Check auth status when the app loads
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                
                if (!token) {
                    setAuthState(prev => ({
                        ...prev,
                        loading: false
                    }));
                    return;
                }

                // Verify token with backend
                const response = await fetch(`${API_URL}/api/admin/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    setAuthState({
                        isAuthenticated: true,
                        isAdmin: true,
                        user: data.admin,
                        token: token,
                        loading: false
                    });
                } else {
                    // Clear invalid token
                    localStorage.removeItem('adminToken');
                    setAuthState({
                        isAuthenticated: false,
                        isAdmin: false,
                        user: null,
                        token: null,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                // Clear token on error
                localStorage.removeItem('adminToken');
                setAuthState({
                    isAuthenticated: false,
                    isAdmin: false,
                    user: null,
                    token: null,
                    loading: false
                });
            }
        };

        verifyAuth();
    }, []);

    // Show loading state while verifying auth
    if (authState.loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading...</div>
        </div>;
    }

    return (
        <AuthContext.Provider value={{ authState, setAuthState }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 