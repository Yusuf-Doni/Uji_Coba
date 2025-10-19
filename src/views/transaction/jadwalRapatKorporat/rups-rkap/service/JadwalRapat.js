import { useAuth } from '@/stores';
import http from '@/service/http/apiBackEnd';

// Add auth interceptor
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
        if (error.response?.data) {
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

const url = 'jadwalRapat';

class JadwalRapatService {
    constructor() {
        this.baseURL = '/api';
        this.url = url;
    }

    // Get meeting schedule with params
    get(params = {}, url = this.url) {
        return http.get(`/${url}`, {
            params: params
        });
    }

    // Get meeting schedule by ID
    async getJadwalRapatById(id) {
        return http.get(`/jadwalRapat/${id}`);
    }

    // Get dropdown data
    getdropdown(params, url = this.url) {
        return http.get(`/${url}`, params);
    }

    getById(id) {
        return http.get(`/${this.url}/${id}`);
    }

    post(data, url = this.url) {
        return http.post(`/${url}`, data);
    }

    put(id, data, url = this.url) {
        return http.put(`/${url}/${id}`, data);
    }

    delete(id, url = this.url) {
        return http.delete(`/${url}/${id}`);
    }

    // Upload meeting material
    async uploadMateriRapatRUPS(jadwalRapatId, jenisFile, file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post(`/jadwalRapat/uploadMateriRapatRUPS`, formData, {
            params: {
                jadwalRapatId,
                jenisFile
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Download meeting material
    async downloadMateriRapatRUPS(id) {
        return http.get(`/jadwalRapat/downloadMateriRapatRUPS/${id}`, {
            responseType: 'blob'
        });
    }

    // Get meeting directions by ID
    async getArahanRapatById(id) {
        return http.get(`/arahanRapat/arahanRUPS/${id}`);
    }

    // Save meeting directions
    async saveArahanRapat(data) {
        return http.post(`/arahanRapat/arahanRUPS`, data);
    }

    // Update meeting directions
    async updateArahanRapat(id, data) {
        return http.put(`/arahanRapat/arahanRUPS/${id}`, data);
    }

    // Upload document
    uploadDocument(data) {
        const formData = new FormData();
        
        // Add meeting data
        if (data.agendaRapat) formData.append('agendaRapat', data.agendaRapat);
        if (data.jenisRapat) formData.append('jenisRapat', data.jenisRapat);
        
        // Add file data
        if (data.fileData && data.fileData.file) {
            formData.append('file', data.fileData.file);
            formData.append('fileName', data.fileData.fileName);
            formData.append('fileSize', data.fileData.fileSize);
            formData.append('fileType', data.fileData.fileType);
        }
        
        return http.post(`/${this.url}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Get PIC options (mock data for now)
    async getPICOptions() {
        // In real implementation, this would call an API
        return Promise.resolve({
            data: {
                success: true,
                data: [
                    { label: 'John Doe - Direktur Utama', value: '619b118e-1385-4b33-ab84-4095013afdc1' },
                    { label: 'Jane Smith - Direktur Keuangan', value: '619b118e-1385-4b33-ab84-4095013afdd2' },
                    { label: 'Bob Johnson - Direktur Operasional', value: '619b118e-1385-4b33-ab84-4095014afdc2' },
                    { label: 'Alice Brown - Sekretaris Perusahaan', value: '619b118e-1385-4b33-ab84-4095013afdc9' }
                ]
            }
        });
    }

    // Get file type options
    async getJenisFileOptions() {
        return Promise.resolve({
            data: {
                success: true,
                data: [
                    { label: 'Presentasi', value: 'presentasi' },
                    { label: 'Notulen', value: 'notulen' },
                    { label: 'Laporan', value: 'laporan' },
                    { label: 'Dokumen Pendukung', value: 'dokumen_pendukung' }
                ]
            }
        });
    }
}

export default new JadwalRapatService();


