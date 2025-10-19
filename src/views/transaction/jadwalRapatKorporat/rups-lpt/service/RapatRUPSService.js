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

class RapatRUPSService {
    constructor() {
        this.baseURL = '/api';
    }

    // Get meeting schedule by ID
    async getJadwalRapatById(id) {
        return http.get(`/jadwalRapat/${id}`);
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

    // Upload file using new endpoint with uploadFileType
    async uploadFileKorporatRUPS(jadwalRapatId, uploadFileType, file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post(`/jadwalRapat/uploadFileKorporatRUPS/${jadwalRapatId}/${uploadFileType}`, formData, {
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
        return http.post(`/arahanRapat/arahanRUPS`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Update meeting directions
    async updateArahanRapat(id, data) {
        return http.put(`/arahanRapat/arahanRUPS/${id}`, data);
    }

    // Get PIC options from API
    async getPICOptions() {
        return http.get('/jadwalRapat/listPic/');
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

    // Get detail RUPS meeting
    async getDetailRapatRUPS(jadwalRapatId) {
        return http.get(`/arahanRapat/detailRapatRUPS/${jadwalRapatId}`);
    }

    async getArahanRUPSEnum() {
        return http.get('/jadwalRapat/arahan-rups-enum');
    }

    // Get Arahan Rapat List
    async getArahanRapatList(jadwalRapatId) {
        return http.get(`/arahanRapat/arahanRUPS?jadwalRapatId=${jadwalRapatId}`);
    }

    // Get Arahan by Jadwal Rapat ID (new endpoint)
    async getArahanByJadwalRapat(jadwalRapatId) {
        return http.get(`/arahanRapat/getByJadwalRapat/${jadwalRapatId}`);
    }

    // Delete Arahan Rapat
    async deleteArahanRapat(id) {
        return http.delete(`/arahanRapat/arahanRUPS/${id}`);
    }

    // Get status tindak lanjut enum
    async getStatusTindakLanjutEnum() {
        return http.get('/approval-tindak-lanjut/status-tindak-lanjut-enum');
    }

    // Submit approval tindak lanjut using PUT (without file)
    async submitApprovalTindakLanjut(id, data) {
        return http.put(`/approval-tindak-lanjut/${id}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Upload file for approval tindak lanjut using PATCH
    async uploadApprovalTindakLanjutFile(id, uploadFileType, file) {
        const formData = new FormData();
        formData.append('file', file);

        return http.patch(`/approval-tindak-lanjut/${id}/upload/${uploadFileType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Get existing approval tindak lanjut
    async getApprovalTindakLanjut(jadwalRapatId) {
        return http.get(`/approval-tindak-lanjut/${jadwalRapatId}`);
    }

    // Get approval tindak lanjut by jadwal rapat ID (new endpoint)
    async getApprovalTindakLanjutByJadwalRapat(jadwalRapatId) {
        return http.get(`/approval-tindak-lanjut/jadwal-rapat/${jadwalRapatId}`);
    }

    // View/Preview file by jadwal rapat ID and upload file type
    async viewFile(jadwalRapatId, uploadFileType) {
        return http.get(`/jadwalRapat/viewFile/${jadwalRapatId}/${uploadFileType}`, {
            responseType: 'blob'
        });
    }

    // Delete arahan rapat by ID
    async deleteArahanRapat(id) {
        return http.delete(`/arahanRapat/${id}`);
    }
}

export default new RapatRUPSService();
