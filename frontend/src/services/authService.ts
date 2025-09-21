import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Token expired or invalid
            removeToken();
            window.location.href = '/'; // Redirect to login
        }
        
        // Extract error message
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'An error occurred';
        
        return Promise.reject(new Error(errorMessage));
    }
);

// Token management functions
export const getToken = () => localStorage.getItem('token');

export const setToken = (token: string) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');

// Auth functions
export const login = async (username: string, password: string) => {
    try {
        const response = await api.post('/auth/login', { username, password });
        const { accessToken, user } = response.data;
        
        setToken(accessToken);
        return { token: accessToken, user };
    } catch (error) {
        throw error;
    }
};

export const signup = async (username: string, password: string) => {
    try {
        const response = await api.post('/auth/register', { username, password });
        const { accessToken, user } = response.data;
        
        setToken(accessToken);
        return { token: accessToken, user };
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
    } finally {
        removeToken();
    }
};

export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;
        
        setToken(accessToken);
        return accessToken;
    } catch (error) {
        removeToken();
        throw error;
    }
};

// Export the axios instance for use in other services
export { api };

// Additional utility functions
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
        // Basic token validation (check if it's expired)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime;
    } catch {
        return false;
    }
};

export const getCurrentUser = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.username,
            // Add other user fields from your JWT payload
        };
    } catch {
        return null;
    }
};