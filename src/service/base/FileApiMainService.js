// import { useAuth } from '@/stores';
import { useAuth } from '@/stores/authStore';
import http from '../http/apiBackEnd';
// import http from '../http/filesApi';

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

export default class FileApiMainService {
    constructor(url) {
        this.url = url;
    }

    downloadWithFileName(fileName, url = this.url) {
        return http.get(`/${url}/${fileName}`, {
            ...http.defaults,
            responseType: 'blob'
        });
    }

    downloadWithURL(url) {
        return http.get(`${url}`, {
            ...http.defaults,
            responseType: 'blob'
        });
    }

    upload(data, module = null) {
        const formData = new FormData();
        formData.append('file', data);
        let url = this.url;
        if (module) {
            url = `${url}?module=${module}`;
        }
        return http.post(`/${url}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}
