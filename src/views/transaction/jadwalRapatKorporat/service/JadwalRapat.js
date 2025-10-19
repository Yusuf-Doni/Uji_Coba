import { useAuth } from '@/stores';
import http from '@/service/http/apiBackEnd';
import FileApiService from '@/service/FileApiService';

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

const url = 'jadwalRapat';

class JadwalRapatService {
    constructor() {
        this.url = url;
    }

    get(params = {}, url = this.url) {
        return http.get(`/${url}`, {
            params: params
        });
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

    /**
     * Upload materi rapat menggunakan FileApiService sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk upload
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.jenisFile - Jenis file yang diupload
     * @param {number} params.statusDecision - Status decision (1 untuk Aktif, 2 untuk Tidak Aktif)
     * @param {File} params.file - File yang akan diupload
     * @returns {Promise} Response dari server
     */
    uploadMateriRapat({ jadwalRapatId, jenisFile, statusDecision, file }) {
        return FileApiService.uploadMateriRapat({
            jadwalRapatId,
            jenisFile,
            statusDecision,
            file
        });
    }

    /**
     * Update decision status untuk jadwal rapat sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk update decision
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {number} params.statusDecision - Status decision (1 untuk Aktif, 2 untuk Tidak Aktif)
     * @returns {Promise} Response dari server
     */
    updateDecision({ jadwalRapatId, statusDecision }) {
        return http.post(`/${this.url}/updateDetailRapat`, null, {
            params: {
                jadwalRapatId,
                statusDecision
            }
        });
    }

}

export default new JadwalRapatService();
