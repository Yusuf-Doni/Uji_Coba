import axios from 'axios';
import { useAuth } from '@/stores/authStore';

const httpClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to handle authentication and multipart/form-data
httpClient.interceptors.request.use(
    function (config) {
        // Add authentication header
        const authStore = useAuth();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        
        // Don't override Content-Type for FormData requests
        if (config.data instanceof FormData) {
            // Remove Content-Type header to let browser set it with boundary
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
        }
        
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
httpClient.interceptors.response.use(
    function (response) {
        // console.log('API Response received:', {
        //     url: response.config.url,
        //     status: response.status,
        //     hasData: !!response.data
        // });
        return response;
    },
    function (error) {
        console.error('HTTP Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.config?.headers
        });
        
        if (error.response?.status === 401) {
            const authStore = useAuth();
            console.error('401 Unauthorized Error Details:', {
                message: error.response.data?.message || 'Unauthorized access',
                url: error.config.url,
                hasToken: !!authStore.token,
                tokenPreview: authStore.token ? authStore.token.substring(0, 10) + '...' : 'No token'
            });
            
            // Handle 401 errors appropriately based on endpoint
            if (!error.config?.url?.includes('validate-token') && 
                !error.config?.url?.includes('arahanRapat')) {
                authStore.removeCredentials();
                location.href = '/auth/login';
            } else {
                console.log('401 error on protected endpoint - not redirecting to login');
            }
        }
        
        return Promise.reject(error);
    }
);

export default httpClient;
