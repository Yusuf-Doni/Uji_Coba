import FileApiMainService from './base/FileApiMainService';
import http from './http/apiBackEnd';
// import http from './http/filesApi';
const url = 'upload';

class FileApiService extends FileApiMainService {
    constructor() {
        super(url);
    }

    /**
     * Upload file sesuai dengan Swagger API
     * Endpoint: POST /api/jadwalRapat/uploadFile/{jadwalRapatId}/{uploadFileType}
     * @param {Object} params - Parameter untuk upload
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.uploadFileType - Jenis file yang diupload (MATERI_RAPAT, KKO, KKF, KR, FRA, CTR, PAKTA_INTEGRITAS, FORM_REVIEW_GOVERNENCE, LAMPIRAN_RAPAT, DOKUMEN_KEPDIR_SIRKULER, DOKUMEN_RUPS_RKAP, DOKUMEN_RUPS_LPT, MATERI_TINDAK_LANJUT)
     * @param {File} params.file - File yang akan diupload
     * @returns {Promise} Response dari server
     */
    uploadMateriRapat({ jadwalRapatId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        const endpoint = `/jadwalRapat/uploadFile/${jadwalRapatId}/${uploadFileType}`;
        console.log('Upload endpoint:', endpoint);
        console.log('Base URL:', http.defaults.baseURL);
        console.log('Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('File type:', uploadFileType);
        // Gunakan endpoint sesuai dengan Swagger API
        // Jangan set Content-Type header secara manual untuk FormData, biarkan browser set boundary
        return http.post(endpoint, formData, {
            timeout: 30000 // Add timeout to prevent hanging requests
        });
    }

    /**
         * Upload file sesuai dengan Swagger API
         * Endpoint: POST /api/jadwalRapat/uploadFile/{jadwalRapatId}/{uploadFileType}
         * @param {Object} params - Parameter untuk upload
         * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
         * @param {string} params.uploadFileType - Jenis file yang diupload (MATERI_RAPAT, KKO, KKF, KR, FRA, CTR, PAKTA_INTEGRITAS, FORM_REVIEW_GOVERNENCE, LAMPIRAN_RAPAT, DOKUMEN_KEPDIR_SIRKULER, DOKUMEN_RUPS_RKAP, DOKUMEN_RUPS_LPT, MATERI_TINDAK_LANJUT)
         * @param {File} params.file - File yang akan diupload
         * @returns {Promise} Response dari server
         */
    uploadFileKorporat({ jadwalRapatId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        const endpoint = `/jadwalRapat/uploadFileKorporat/${jadwalRapatId}/${uploadFileType}`;
        console.log('🚀 UploadFileKorporat Debug Info:');
        console.log('  - Endpoint:', endpoint);
        console.log('  - Base URL:', http.defaults.baseURL);
        console.log('  - Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('  - File type:', uploadFileType);
        console.log('  - File object:', file);
        console.log('  - Method: POST');
        console.log('  - Content-Type: multipart/form-data (auto-set by browser)');
        
        // Gunakan endpoint sesuai dengan Swagger API
        // Pastikan Content-Type header tidak di-override untuk FormData
        return http.post(endpoint, formData, {
            timeout: 30000, // Add timeout to prevent hanging requests
            headers: {
                'Content-Type': undefined // Biarkan browser set Content-Type dengan boundary
            }
        }).catch(error => {
            console.error('❌ UploadFileKorporat Error:', error);
            console.error('  - Status:', error.response?.status);
            console.error('  - Data:', error.response?.data);
            console.error('  - Headers:', error.response?.headers);
            console.error('  - Message:', error.message);
            throw error; // Re-throw error untuk ditangani oleh caller
        });
    }


    /**
     * View file sesuai dengan Swagger API
     * Endpoint: GET /api/jadwalRapat/viewFile/{jadwalRapatId}/{uploadFileType}
     * @param {Object} params - Parameter untuk view file
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.uploadFileType - Jenis file yang akan dilihat (MATERI_RAPAT, KKO, KKF, KR, FRA, CTR, PAKTA_INTEGRITAS, FORM_REVIEW_GOVERNENCE, LAMPIRAN_RAPAT, DOKUMEN_KEPDIR_SIRKULER, DOKUMEN_RUPS_RKAP, DOKUMEN_RUPS_LPT, MATERI_TINDAK_LANJUT)
     * @returns {Promise} Response dari server dengan file data
     */
    viewFile({ jadwalRapatId, uploadFileType }) {
        const endpoint = `/jadwalRapat/viewFile/${jadwalRapatId}/${uploadFileType}`;
        console.log('View file endpoint:', endpoint);
        console.log('Base URL:', http.defaults.baseURL);
        console.log('Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('File type:', uploadFileType);
        
        // Gunakan endpoint sesuai dengan Swagger API
        return http.get(endpoint, {
            responseType: 'blob'
        });
    }

    /**
     * Update file sesuai dengan Swagger API
     * Endpoint: PATCH /api/jadwalRapat/uploadFile/{jadwalRapatId}/{uploadFileType}
     * @param {Object} params - Parameter untuk update file
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.uploadFileType - Jenis file yang akan diupdate (MATERI_RAPAT, KKO, KKF, KR, FRA, CTR, PAKTA_INTEGRITAS, FORM_REVIEW_GOVERNENCE, LAMPIRAN_RAPAT, DOKUMEN_KEPDIR_SIRKULER, DOKUMEN_RUPS_RKAP, DOKUMEN_RUPS_LPT, MATERI_TINDAK_LANJUT)
     * @param {File} params.file - File yang akan diupdate
     * @returns {Promise} Response dari server
     */
    updateMateriRapat({ jadwalRapatId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        const endpoint = `/jadwalRapat/uploadFile/${jadwalRapatId}/${uploadFileType}`;
        console.log('Update file endpoint:', endpoint);
        console.log('Base URL:', http.defaults.baseURL);
        console.log('Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('File type:', uploadFileType);
        
        // Gunakan PATCH method sesuai dengan Swagger API untuk update file
        // Jangan set Content-Type header secara manual untuk FormData, biarkan browser set boundary
        return http.patch(endpoint, formData, {
            timeout: 30000 // Add timeout to prevent hanging requests
        });
    }

    /**
     * Update file Kajian Rapat yang sudah di upload sebelumnya, jika ada user yang disapprove/tolak 
     * dari role 'BOD', 'SEKPER', 'RISIKO', 'KEPATUHAN', 'LEGAL'
     * Endpoint: PATCH /api/jadwalRapat/updateKajianRapat/{jadwalRapatId}/{uploadFileType}
     * @param {Object} params - Parameter untuk update file
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.uploadFileType - Jenis file yang akan diupdate (MATERI_RAPAT, KKO, KKF, KR, FRA, CTR, PAKTA_INTEGRITAS, FORM_REVIEW_GOVERNENCE, LAMPIRAN_RAPAT, DOKUMEN_KEPDIR_SIRKULER, DOKUMEN_RUPS_RKAP, DOKUMEN_RUPS_LPT, MATERI_TINDAK_LANJUT)
     * @param {File} params.file - File yang akan diupdate (string binary)
     * @returns {Promise} Response dari server
     */
    updateKajianRapat({ jadwalRapatId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Gunakan endpoint khusus updateKajianRapat sesuai dengan Swagger API
        const endpoint = `/jadwalRapat/updateKajianRapat/${jadwalRapatId}/${uploadFileType}`;
        console.log('🔄 UpdateKajianRapat Debug Info:');
        console.log('  - Endpoint:', endpoint);
        console.log('  - Base URL:', http.defaults.baseURL);
        console.log('  - Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('  - File type:', uploadFileType);
        console.log('  - File object:', file);
        console.log('  - Method: PATCH');
        console.log('  - Content-Type: multipart/form-data (auto-set by browser)');
        console.log('  - Note: Using dedicated updateKajianRapat endpoint');
        
        // Gunakan PATCH method pada endpoint updateKajianRapat yang khusus untuk update
        // Pastikan Content-Type header tidak di-override untuk FormData
        return http.patch(endpoint, formData, {
            timeout: 30000, // Add timeout to prevent hanging requests
            headers: {
                'Content-Type': undefined // Biarkan browser set Content-Type dengan boundary
            }
        }).catch(error => {
            console.error('❌ UpdateKajianRapat Error:', error);
            console.error('  - Status:', error.response?.status);
            console.error('  - Data:', error.response?.data);
            console.error('  - Headers:', error.response?.headers);
            console.error('  - Message:', error.message);
            throw error; // Re-throw error untuk ditangani oleh caller
        });
    }

    /**
     * Update file Kajian Rapat menggunakan endpoint uploadFileKorporat dengan PATCH method
     * Fallback method jika updateKajianRapat endpoint tidak tersedia
     * @param {Object} params - Parameter untuk update file
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.uploadFileType - Jenis file yang akan diupdate
     * @param {File} params.file - File yang akan diupdate
     * @returns {Promise} Response dari server
     */
    updateFileKorporat({ jadwalRapatId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Fallback: menggunakan endpoint uploadFileKorporat dengan PATCH method
        const endpoint = `/jadwalRapat/uploadFileKorporat/${jadwalRapatId}/${uploadFileType}`;
        console.log('🔧 UpdateFileKorporat (Fallback) Debug Info:');
        console.log('  - Endpoint:', endpoint);
        console.log('  - Base URL:', http.defaults.baseURL);
        console.log('  - Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('  - File type:', uploadFileType);
        console.log('  - File object:', file);
        console.log('  - Method: PATCH');
        console.log('  - Content-Type: multipart/form-data (auto-set by browser)');
        console.log('  - Note: Using uploadFileKorporat endpoint with PATCH method as fallback');
        
        // Gunakan PATCH method pada endpoint uploadFileKorporat sebagai fallback
        // Pastikan Content-Type header tidak di-override untuk FormData
        return http.patch(endpoint, formData, {
            timeout: 30000, // Add timeout to prevent hanging requests
            headers: {
                'Content-Type': undefined // Biarkan browser set Content-Type dengan boundary
            }
        }).catch(error => {
            console.error('❌ UpdateFileKorporat (Fallback) Error:', error);
            console.error('  - Status:', error.response?.status);
            console.error('  - Data:', error.response?.data);
            console.error('  - Headers:', error.response?.headers);
            console.error('  - Message:', error.message);
            throw error; // Re-throw error untuk ditangani oleh caller
        });
    }

    /**
     * Upload Form Review Governance sesuai dengan Swagger API
     * Endpoint: POST /api/jadwalRapat/uploadReviewGovernence/{jadwalRapatId}/{uploadFileType}
     * @param {Object} params - Parameter untuk upload Form Review Governance
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.uploadFileType - Jenis file yang diupload (FORM_REVIEW_GOVERNENCE)
     * @param {File} params.file - File yang akan diupload
     * @returns {Promise} Response dari server
     */
    uploadReviewGovernence({ jadwalRapatId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        const endpoint = `/jadwalRapat/uploadReviewGovernence/${jadwalRapatId}/${uploadFileType}`;
        console.log('🚀 UploadReviewGovernence Debug Info:');
        console.log('  - Endpoint:', endpoint);
        console.log('  - Base URL:', http.defaults.baseURL);
        console.log('  - Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('  - File type:', uploadFileType);
        console.log('  - File object:', file);
        console.log('  - Method: POST');
        console.log('  - Content-Type: multipart/form-data (auto-set by browser)');
        console.log('  - Note: Using dedicated uploadReviewGovernence endpoint');
        
        // Gunakan endpoint khusus uploadReviewGovernence sesuai dengan Swagger API
        // Pastikan Content-Type header tidak di-override untuk FormData
        return http.post(endpoint, formData, {
            timeout: 30000, // Add timeout to prevent hanging requests
            headers: {
                'Content-Type': undefined // Biarkan browser set Content-Type dengan boundary
            }
        }).catch(error => {
            console.error('❌ UploadReviewGovernence Error:', error);
            console.error('  - Status:', error.response?.status);
            console.error('  - Data:', error.response?.data);
            console.error('  - Headers:', error.response?.headers);
            console.error('  - Message:', error.message);
            throw error; // Re-throw error untuk ditangani oleh caller
        });
    }

    /**
     * Update file yang sudah ada sesuai dengan Swagger API
     * Endpoint: PATCH /api/jadwalRapat/updateUploadFile/{jadwalRapatId}/{uploadFileType}
     * @param {Object} params - Parameter untuk update
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.uploadFileType - Jenis file yang akan diupdate
     * @param {File} params.file - File yang akan diupdate
     * @returns {Promise} Response dari server
     */
    updateUploadFile({ jadwalRapatId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        const endpoint = `/jadwalRapat/updateUploadFile/${jadwalRapatId}/${uploadFileType}`;
        console.log('🔄 UpdateUploadFile Debug Info:');
        console.log('  - Endpoint:', endpoint);
        console.log('  - Base URL:', http.defaults.baseURL);
        console.log('  - Full URL:', `${http.defaults.baseURL}${endpoint}`);
        console.log('  - File type:', uploadFileType);
        console.log('  - Method: PATCH');
        
        return http.patch(endpoint, formData, {
            timeout: 30000,
            headers: {
                'Content-Type': undefined // Biarkan browser set Content-Type dengan boundary
            }
        }).catch(error => {
            console.error('❌ UpdateUploadFile Error:', error);
            console.error('  - Status:', error.response?.status);
            console.error('  - Data:', error.response?.data);
            console.error('  - Message:', error.message);
            throw error;
        });
    }

    /**
     * Upload file dengan parameter khusus menggunakan method upload dari FileApiMainService
     * @param {File} file - File yang akan diupload
     * @param {string} module - Module atau parameter tambahan untuk URL
     * @returns {Promise} Response dari server
     */
    uploadWithModule(file, module) {
        return this.upload(file, module);
    }
}

export default new FileApiService();
