import { useAuth } from '@/stores';
import http from '@/service/http/apiBackEnd';
import FileApiService from '@/service/FileApiService';

// Add authentication interceptor
http.interceptors.request.use(
    function (config) {
        const authStore = useAuth();
        
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
            console.log('Authorization header set:', config.headers.Authorization);
        } else {
            console.warn('No token found in auth store');
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
        console.error('HTTP Error:', error);
        
        if (error.response?.data) {
            const authStore = useAuth();
            const resp = error.response.data;
            if (resp.code === 401 && !error.config?.url?.includes('validate-token')) {
                console.log('401 Unauthorized detected, redirecting to login');
                authStore.removeCredentials();
                location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

const url = 'approval-tindak-lanjut';

class TindakLanjutService {
    constructor() {
        this.url = url;
    }

    get(params = {}, url = this.url) {
        return http.get(`/${url}`, params
        //     {
        //     params: params
        // }
    );
    }

    getdropdown(params = {}, url = this.url) {
        return http.get(`/${url}`, params
        //     {
        //     params: params
        // }
    );
    }

    getById(id) {
        return http.get(`/${this.url}/${id}`);
    }

    post(data, url = this.url) {
        return http.post(`/${url}`, data);
    }

    put(id, data, url = this.url) {
        console.log('=== TindakLanjutService.put ===');
        console.log('URL:', `/${url}/${id}`);
        console.log('Data:', data);
        console.log('Full URL will be:', `/api/${url}/${id}`);
        
        const endpoint = `/${url}/${id}`;
        console.log('Final endpoint:', endpoint);
        
        return http.put(endpoint, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    delete(id, url = this.url) {
        return http.delete(`/${url}/${id}`);
    }

    /**
     * Approve tindak lanjut rapat
     * @param {string} id - ID approval tindak lanjut (UUID)
     * @param {string} jadwalRapatId - ID jadwal rapat
     * @param {string} picId - ID PIC
     * @returns {Promise} Response dari server
     */
    approve(id, jadwalRapatId, picId) {
        const data = {
            statusApproval: 1,  // 1 = Approved
            jadwalRapatId: jadwalRapatId,
            picId: picId
        };
        
        console.log('=== TindakLanjutService.approve ===');
        console.log('ID:', id);
        console.log('Data:', data);
        
        return this.put(id, data);
    }

    /**
     * Reject tindak lanjut rapat
     * @param {string} id - ID approval tindak lanjut (UUID)
     * @param {string} jadwalRapatId - ID jadwal rapat
     * @param {string} picId - ID PIC
     * @param {string} reason - Alasan penolakan
     * @returns {Promise} Response dari server
     */
    reject(id, jadwalRapatId, picId, reason) {
        const data = {
            statusApproval: 2,  // 2 = Rejected
            deskripsi: reason,   // Alasan penolakan
            jadwalRapatId: jadwalRapatId,
            picId: picId
        };
        
        console.log('=== TindakLanjutService.reject ===');
        console.log('ID:', id);
        console.log('Reason:', reason);
        console.log('Data:', data);
        
        return this.put(id, data);
    }

    /**
     * Upload materi tindak lanjut menggunakan endpoint approval-tindak-lanjut
     * @param {Object} params - Parameter untuk upload
     * @param {string} params.id - ID tindak lanjut (UUID)
     * @param {string} params.uploadFileType - Jenis file yang diupload
     * @param {File} params.file - File yang akan diupload
     * @returns {Promise} Response dari server
     */
    uploadMateriTindakLanjut({ id, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Menggunakan endpoint yang benar sesuai API documentation
        const endpoint = `/approval-tindak-lanjut/${id}/upload/${uploadFileType}`;
        console.log('Upload tindak lanjut endpoint:', endpoint);
        console.log('Using approval-tindak-lanjut endpoint for tindak lanjut');
        
        // Get auth token manually to ensure it's included
        const authStore = useAuth();
        const headers = {
            'Content-Type': 'multipart/form-data'
        };
        
        if (authStore.token) {
            headers.Authorization = `Bearer ${authStore.token}`;
            console.log('Authorization header set for upload:', headers.Authorization);
        } else {
            console.warn('No token found for upload request');
        }
        
        return http.patch(endpoint, formData, { headers });
    }

    /**
     * Update materi tindak lanjut yang sudah ada menggunakan endpoint approval-tindak-lanjut
     * @param {Object} params - Parameter untuk update
     * @param {string} params.id - ID tindak lanjut (UUID)
     * @param {string} params.uploadFileType - Jenis file yang diupdate
     * @param {File} params.file - File yang akan diupdate
     * @returns {Promise} Response dari server
     */
    updateMateriTindakLanjut({ id, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Menggunakan endpoint yang benar sesuai API documentation
        const endpoint = `/approval-tindak-lanjut/${id}/upload/${uploadFileType}`;
        console.log('Update tindak lanjut endpoint:', endpoint);
        console.log('Using approval-tindak-lanjut endpoint for tindak lanjut update');
        
        // Get auth token manually to ensure it's included
        const authStore = useAuth();
        const headers = {
            'Content-Type': 'multipart/form-data'
        };
        
        if (authStore.token) {
            headers.Authorization = `Bearer ${authStore.token}`;
            console.log('Authorization header set for update:', headers.Authorization);
        } else {
            console.warn('No token found for update request');
        }
        
        return http.patch(endpoint, formData, { headers });
    }

    /**
     * View file materi tindak lanjut menggunakan endpoint approval-tindak-lanjut
     * @param {Object} params - Parameter untuk view file
     * @param {string} params.id - ID tindak lanjut (UUID)
     * @param {string} params.uploadFileType - Jenis file yang akan dilihat
     * @returns {Promise} Response dari server (blob)
     */
    viewFileTindakLanjut({ id, uploadFileType }) {
        // Get auth token manually to ensure it's included
        const authStore = useAuth();
        const headers = {};
        
        if (authStore.token) {
            headers.Authorization = `Bearer ${authStore.token}`;
            console.log('Authorization header set for view file:', headers.Authorization);
        } else {
            console.warn('No token found for view file request');
        }
        
        // Menggunakan endpoint yang benar sesuai API documentation: GET /api/approval-tindak-lanjut/viewFile/{id}/{uploadFileType}
        const endpoint = `/approval-tindak-lanjut/viewFile/${id}/${uploadFileType}`;
        console.log('View file tindak lanjut endpoint:', endpoint);
        console.log('Using approval-tindak-lanjut endpoint for tindak lanjut view');
        console.log('Full URL will be:', `${http.defaults.baseURL}${endpoint}`);
        
        return http.get(endpoint, {
            responseType: 'blob',
            headers
        });
    }
}

export default new TindakLanjutService();
