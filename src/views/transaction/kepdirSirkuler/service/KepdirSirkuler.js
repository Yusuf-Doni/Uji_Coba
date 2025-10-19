import { useAuth } from '@/stores';
import http from '@/service/http/apiBackEnd';
import FileApiService from '@/service/FileApiService';

// Add authentication interceptor
http.interceptors.request.use(
    function (config) {
        const authStore = useAuth();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
            console.log('Adding Authorization header:', `Bearer ${authStore.token}`);
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

const url = 'kepdir';

class KepdirSirkulerService {
    constructor() {
        this.url = url;
    }

    /**
     * Get kepdir data with pagination and filtering according to Swagger API
     * @param {Object} params - Query parameters
     * @param {string} params.search - Search term
     * @param {number} params.tahun - Year filter
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 10)
     * @param {Array<string>} params.order_by - Fields to order by (default: ["tanggalTerbit"])
     * @param {string} params.sort - Sort direction: "ASC" or "DESC" (default: "DESC")
     * @param {boolean} params.show_all - Show all records (default: false)
     * @param {string} url - API endpoint URL
     * @returns {Promise} Response from server
     */
    get(params = {}, url = this.url) {
        // Set default values according to Swagger API
        const defaultParams = {
            search: '',
            tahun: null,
            page: 1,
            limit: 10,
            order_by: ['tanggalTerbit'],
            sort: 'DESC',
            show_all: false
        };
        
        // Merge with provided params
        const queryParams = { ...defaultParams, ...params };
        
        // Convert array to proper format for query string
        if (Array.isArray(queryParams.order_by)) {
            queryParams.order_by = queryParams.order_by.join(',');
        }
        
        return http.get(`/${url}`, {
            params: queryParams
        });
    }

    getdropdown(params, url = this.url) {
        return http.get(`/${url}`, params);
    }

    /**
     * Get dropdown data for agenda rapat (jadwal rapat)
     * @returns {Promise} Response containing jadwal rapat dropdown data
     */
    getAgendaRapatDropdown() {
        return http.get(`/${url}/listAgendaRapat/`);
    }

    /**
     * Add new Kepdir using the correct API endpoint
     * @param {Object} params - Parameters for adding Kepdir
     * @param {string} params.jadwalRapatId - UUID of jadwal rapat
     * @param {string} params.judul - Title of Kepdir
     * @param {string} params.tanggalTerbit - Publication date (ISO string)
     * @param {number} params.tahun - Year
     * @param {string} params.uploadFileType - File type (DRAFT_KEPDIR)
     * @param {File} params.file - PDF file
     * @returns {Promise} Response from server
     */
    addKepdir({ jadwalRapatId, judul, tanggalTerbit, tahun, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post('/kepdir/add', formData, {
            params: {
                jadwalRapatId,
                judul,
                tanggalTerbit,
                tahun,
                uploadFileType
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    uploadKajianRapat({ kepdirId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post(`/kepdir/uploadKajianRapat/${kepdirId}/${uploadFileType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    viewKepdirFile({ kepdirId, uploadFileType }) {
        return http.get(`/kepdir/viewFile/${kepdirId}/${uploadFileType}`, {
            responseType: 'blob'
        });
    }

    uploadReviewGovernance({ kepdirId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post(`/kepdir/uploadReviewGovernence/${kepdirId}/${uploadFileType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
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

    /**
     * Add kepdir sirkuler sesuai dengan Swagger API
     * Endpoint: POST /api/kepdir/add
     * @param {Object} params - Parameter untuk add kepdir
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID, optional)
     * @param {string} params.judul - Judul kepdir (required)
     * @param {string} params.tanggalTerbit - Tanggal terbit dalam format ISO string tanpa timezone (required, e.g., "2025-10-20T00:00:00")
     * @param {number} params.tahun - Tahun (required)
     * @param {string} params.uploadFileType - Tipe file upload (required, enum: MATERI_RAPAT, KKO, KKF, KR, FRA, CTR, PAKTA_INTEGRITAS, FORM_REVIEW_GOVERNENCE, LAMPIRAN_RAPAT, DOKUMEN_KEPDIR_SIRKULER, DOKUMEN_RUPS_RKAP, DOKUMEN_RUPS_LPT, MATERI_TINDAK_LANJUT, DRAFT_KEPDIR)
     * @param {File} params.file - File yang akan diupload (required)
     * @returns {Promise} Response dari server
     */
    addKepdir({ jadwalRapatId, judul, tanggalTerbit, tahun, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Prepare query parameters exactly as shown in Swagger UI
        const queryParams = {
            judul,
            tanggalTerbit,
            tahun,
            uploadFileType
        };
        
        // Add jadwalRapatId only if provided (optional parameter)
        if (jadwalRapatId) {
            queryParams.jadwalRapatId = jadwalRapatId;
        }
        
        // Debug logging to match Swagger UI format
        console.log('API Call Parameters:');
        console.log('- judul:', judul);
        console.log('- tanggalTerbit:', tanggalTerbit);
        console.log('- tahun:', tahun);
        console.log('- uploadFileType:', uploadFileType);
        console.log('- jadwalRapatId:', jadwalRapatId || 'not provided');
        console.log('- file:', file?.name || 'no file');
        console.log('Full query params:', queryParams);
        
        return http.post(`/${this.url}/add`, formData, {
            params: queryParams,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Upload file untuk kepdir sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk upload file
     * @param {string} params.kepdirId - ID kepdir (UUID)
     * @param {string} params.uploadFileType - Tipe file yang diupload
     * @param {File} params.file - File yang akan diupload
     * @returns {Promise} Response dari server
     */
    uploadFile({ kepdirId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post(`/${this.url}/uploadFile/${kepdirId}/${uploadFileType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Approval Kajian Rapat
     * @param {Object} data - Approval data
     * @param {string} data.kepdirId - ID of the Kepdir
     * @param {number} data.roleId - Role ID of the user (2=Sekper, 3=Legal, 4=Risiko, 5=Kepatuhan)
     * @param {number} data.statusApproval - Status approval (1 = Approve, 2 = Reject)
     * @param {string} data.alasan - Reason for rejection (required if statusApproval = 2)
     * @returns {Promise} Response from server
     */
    approvalKajianRapat(data) {
        console.log('=== KepdirSirkulerService.approvalKajianRapat ===');
        console.log('Data:', data);
        
        return http.post('/kepdir/approvalKajianRapat', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Get approval status for kajian rapat
     * @param {string} kepdirId - ID of the Kepdir
     * @returns {Promise} Response from server
     */
    getApprovalStatus(kepdirId) {
        console.log('=== KepdirSirkulerService.getApprovalStatus ===');
        console.log('KepdirId:', kepdirId);
        
        // TODO: Replace with actual endpoint when available
        // For now, return a dummy response indicating no approval status
        return Promise.resolve({
            data: {
                code: 404,
                message: 'Approval status not found',
                data: null
            }
        });
        
        // When real endpoint is available, use this:
        // return http.get(`/kepdir/approvalStatus/${kepdirId}`);
    }

    /**
     * Approval Kepdir oleh Sekper di akhir flow
     * @param {FormData} formData - Form data containing kepdirId, statusApproval, alsanTolak, and optional file
     * @returns {Promise} Response from server
     */
    approvalKepdirSekper(formData) {
        console.log('=== KepdirSirkulerService.approvalKepdirSekper ===');
        console.log('FormData:', formData);
        
        return http.post('/kepdir/approvalKepdirSekper', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}

export default new KepdirSirkulerService();
