import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authAPI.getMe();
                setUser(response.data.user);
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (loginInput, password) => {
        const response = await authAPI.login({ loginInput, password });
        // If login successful, set token and user
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
        }
        return response.data;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        // If registration returns token directly (no OTP), strict login
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
        }
        return response.data;
    };

    const verifyOTP = async (email, otp) => {
        const response = await authAPI.verifyOTP({ email, otp });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
        }
        return response.data;
    };

    const resendOTP = async (email) => {
        const response = await authAPI.resendOTP({ email });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
