import { useAuth } from '@/stores';
import http from './http/auth';

export default class AuthService {
    constructor(url) {
        this.url = url;
    }


    post(data) {
        return http.post(`/${this.url}`, data);
    }

    postWithCredentials(data = {}) {
        const authStore = useAuth();
        return http.post(
            `/${this.url}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        );
    }
}
