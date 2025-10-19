import { useAuth } from '@/stores';
import http from '../http/auth';

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

http.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response.data) {
            const authStore = useAuth();
            const resp = error.response.data;
            if (resp.code === 401 && !error.config?.url?.includes('validate-token')) {
                authStore.logout().finally(() => {
                    location.href = '/auth/login';
                });
            }
        }
        return Promise.reject(error);
    }
);

export default class AuthUserManagementService {
    constructor(url) {
        this.url = url;
    }

    get(param, url = this.url) {
        return http.get(`/${url}`, {
            params: param
        });
    }

    getById(id) {
        return http.get(`/${this.url}/${id}`);
    }

    post(data, url = this.url) {
        return http.post(`/${url}`, data);
    }

    put(data, url = this.url) {
        return http.put(`/${url}`, data);
    }

    delete(id, url = this.url) {
        return http.delete(`/${url}/${id}`);
    }
}
