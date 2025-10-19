import { useAuth } from '@/stores';
import http from '@/service/http/apiBackEnd';

// Add authentication interceptor
http.interceptors.request.use(
    function (config) {
        const authStore = useAuth();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Add response interceptor
http.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response?.data) {
            const authStore = useAuth();
            const resp = error.response.data;
            if (resp.code === 401 && !error.config?.url?.includes('validate-token')) {
                authStore.removeCredentials();
                location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);
const reg = 'register';

class RegisterService {
    constructor() {
        this.url = reg;
    }

    post(data) {
        console.log('data', data);
        return http.post(`/${this.url}`, data);
    }

    put(id, data) {
        return http.put(`/${this.url}/${id}`, data);
    }
}

export default new RegisterService();