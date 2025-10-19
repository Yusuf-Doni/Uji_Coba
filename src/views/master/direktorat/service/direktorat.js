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

const url = 'direktorat';

class DirektoratService {
    constructor() {
        this.url = url;
    }

    get(params, url = this.url) {
        return http.get(`/${url}`, params
        //     {
        //     params: param
        // }
    );
    }

    getdropdown(params, url = this.url) {
        return http.get(`/${url}`, params
        //     {
        //     params: param
        // }
    );
    }

    getById(id) {
        return http.get(`/${this.url}/${id}`);
    }

    post(data, url = this.url) {
        return http.post(`/${url}`, data);
    }

    put(id,data, url = this.url) {
        return http.put(`/${url}/${id}`, data);
    }

    delete(id, url = this.url) {
        return http.delete(`/${url}/${id}`);
    }
}

export default new DirektoratService();
