import { useAuth } from '@/stores';
import http from '../http/master';

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
            if (resp.code === 401) {
                authStore.logout().finally(() => {
                    location.href = '/auth/login';
                });
            }
        }
        return Promise.reject(error);
    }
);

export default class MasterMainService {
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

    post(data) {
        return http.post(`/${this.url}`, data);
    }

    put(data) {
        return http.put(`/${this.url}`, data);
    }

    delete(id) {
        return http.delete(`/${this.url}/${id}`);
    }
}
