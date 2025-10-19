import { useAuth } from '@/stores/authStore';
import http from '@/service/http/apiBackEnd';

// Add authentication interceptor
http.interceptors.request.use(
    function (config) {
        const authStore = useAuth();
        
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
            console.log('Authorization header set for URL:', config.url);
            console.log('Token (first 10 chars):', authStore.token.substring(0, 10) + '...');
            console.log('Full headers:', config.headers);
        } else {
            console.warn('No token found in auth store for URL:', config.url);
            console.warn('Auth store state:', {
                isLoggedIn: authStore.isLoggedIn,
                hasToken: !!authStore.token,
                tokenLength: authStore.token ? authStore.token.length : 0
            });
        }
        return config;
    },
    function (error) {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
http.interceptors.response.use(
    function (response) {
        console.log('API Response received:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    function (error) {
        console.error('HTTP Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.config?.headers
        });
        
        if (error.response?.data) {
            const authStore = useAuth();
            const resp = error.response.data;
            
            if (error.response.status === 401) {
                console.error('401 Unauthorized Error Details:', {
                    message: resp.message || 'Unauthorized access',
                    code: resp.code,
                    url: error.config.url,
                    hasToken: !!authStore.token,
                    tokenPreview: authStore.token ? authStore.token.substring(0, 10) + '...' : 'No token'
                });
                
                // Only redirect to login for specific endpoints, not for detail pages or arahanRapat
                if (!error.config?.url?.includes('validate-token') && 
                    !error.config?.url?.includes('getJadwalRapatDetail') &&
                    !error.config?.url?.includes('arahanRapat')) {
                    console.log('Redirecting to login due to 401 error');
                    authStore.removeCredentials();
                    location.href = '/auth/login';
                } else {
                    console.log('401 error on protected endpoint - not redirecting to login');
                    console.log('Endpoint:', error.config?.url, 'should handle 401 gracefully');
                }
            }
        }
        return Promise.reject(error);
    }
);

const url = 'jadwalRapat';

class DetailRapatKomisDireksidankomiteService {
    constructor() {
        this.url = url;
    }

    get(id, params = {}, url = this.url) {
        // Ensure ID is properly encoded and handle both UUID and string IDs
        const encodedId = encodeURIComponent(id);
        console.log('Making API call with ID:', id, 'Encoded:', encodedId);
        console.log('Request URL:', `/${url}/${encodedId}`);
        console.log('Request params:', params);
        
        // Use the correct endpoint format: /api/jadwalRapat/{id}
        return http.get(`/${url}/${encodedId}`, {
            params: params
        });
    }

    getdropdown(params = {}, url = this.url) {
        return http.get(`/${url}`, {
            params: params
        });
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

    // Method khusus untuk mendapatkan detail rapat dengan struktur JSON yang baru
    getDetailRapat(params = {}) {
        return http.get(`/${this.url}/detail`, {
            params: params
        });
    }

    // Method untuk menyimpan data rapat dengan struktur yang sesuai
    saveDetailRapat(data) {
        return http.post(`/${this.url}/detail`, data);
    }

    // Method untuk update data rapat
    updateDetailRapat(id, data) {
        return http.put(`/${this.url}/detail/${id}`, data);
    }

    // Method untuk mendapatkan daftar keputusan/keputusan rapat
    getKeputusanRapat(id, params = {}) {
        console.log('Getting keputusan rapat for ID:', id);
        console.log('Request params:', params);
        
        return http.get(`/${this.url}/${id}/keputusan`, {
            params: params
        });
    }

       /**
     * Approval attachment sekper sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk approval attachment sekper
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {number} params.statusCekLampiran - Status cek lampiran (0: default, 1: approve, 2: reject)
     * @param {string} params.alasan - Alasan approval/rejection
     * @returns {Promise} Response dari server
     */
       approvalAttachmentSekper({ jadwalRapatId, statusCekLampiran, alasan }) {
        const payload = {
            jadwalRapatId,
            statusCekLampiran,
            alasan
        };
        
        return http.post(`/${this.url}/approvalAttachmentSekper`, payload);
    }

    /**
     * Get jadwal rapat detail sesuai dengan Swagger API
     * @param {string} jadwalRapatId - ID jadwal rapat (UUID)
     * @returns {Promise} Response dari server
     */
    getJadwalRapatDetail(jadwalRapatId) {
        return http.get(`/${this.url}/getJadwalRapatDetail/${jadwalRapatId}`);
    }

    
    /**
     * Approval kajian rapat sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk approval kajian rapat
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.fileKajianId - ID file kajian (UUID)
     * @param {number} params.roleId - ID role yang melakukan approval
     * @param {number} params.statusApproval - Status approval (0: default, 1: approve, 2: reject)
     * @param {string} params.alasan - Alasan approval/rejection
     * @returns {Promise} Response dari server
     */
    approvalKajianRapat({ jadwalRapatId, fileKajianId, roleId, statusApproval, alasan }) {
        const payload = {
            jadwalRapatId,
            fileKajianId,
            roleId,
            statusApproval,
            alasan
        };
        
        return http.post(`/${this.url}/approvalKajianRapat`, payload);
    }

    /**
     * Get list PIC sesuai dengan Swagger API
     * @returns {Promise} Response dari server berisi list PIC
     */
    getListPic() {
        return http.get(`/${this.url}/listPic/`);
    }

    /**
     * Submit PIC dan Arahan Rapat sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk submit PIC dan arahan rapat
     * @param {string} params.jadwalRapatId - ID jadwal rapat (UUID)
     * @param {string} params.jadwalRapatDetailId - ID jadwal rapat detail (UUID)
     * @param {string} params.arahan - Arahan rapat
     * @param {string} params.targetWaktu - Target waktu dalam format ISO 8601
     * @param {Array<string>} params.picId - Array ID PIC (UUID)
     * @returns {Promise} Response dari server
     */
    submitPicdanArahanRapat({ jadwalRapatId, jadwalRapatDetailId, arahan, targetWaktu, picId }) {
        const payload = {   
            jadwalRapatId,
            jadwalRapatDetailId,
            arahan,
            targetWaktu,
            picId
        };
        console.log('Submitting PIC dan Arahan Rapat:', payload);
        console.log('Request URL:', `/arahanRapat`);
        
        return http.post(`/arahanRapat`, payload)
            .then(response => {
                console.log('Arahan Rapat response:', response);
                return response;
            })
            .catch(error => {
                console.error('Arahan Rapat error:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url,
                    method: error.config?.method
                });
                throw error;
            });
    }

    /**
     * Get arahan rapat by ID sesuai dengan Swagger API
     * @param {string} id - ID arahan rapat (UUID)
     * @returns {Promise} Response dari server berisi detail arahan rapat
     */
    getArahanRapatById(id) {
        return http.get(`/api/arahanRapat/${id}`);
    }

    // /**
    //  * Get list arahan rapat by jadwal rapat ID sesuai dengan Swagger API
    //  * @param {string} jadwalRapatId - ID jadwal rapat (UUID)
    //  * @returns {Promise} Response dari server berisi list arahan rapat
    //  */
    // getArahanRapatListByJadwalRapatId(jadwalRapatId) {
    //     return http.get(`/api/arahanRapat/jadwalRapat/${jadwalRapatId}`);
    // }

    /**
     * Get detail Kepdir by ID sesuai dengan Swagger API
     * @param {string} id - ID kepdir (UUID)
     * @returns {Promise} Response dari server berisi detail kepdir
     */
    getKepdirById(id) {
        return http.get(`/kepdir/${id}`);
    }

    /**
     * Upload kajian rapat sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk upload kajian rapat
     * @param {string} params.kepdirId - ID kepdir (UUID)
     * @param {string} params.uploadFileType - Tipe file yang diupload
     * @param {File} params.file - File yang akan diupload
     * @returns {Promise} Response dari server
     */
    uploadKajianRapat({ kepdirId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post(`/kepdir/uploadKajianRapat/${kepdirId}/${uploadFileType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Upload review governance sesuai dengan Swagger API
     * @param {Object} params - Parameter untuk upload review governance
     * @param {string} params.kepdirId - ID kepdir (UUID)
     * @param {string} params.uploadFileType - Tipe file yang diupload
     * @param {File} params.file - File yang akan diupload
     * @returns {Promise} Response dari server
     */
    uploadReviewGovernance({ kepdirId, uploadFileType, file }) {
        const formData = new FormData();
        formData.append('file', file);
        
        return http.post(`/kepdir/uploadReviewGovernence/${kepdirId}/${uploadFileType}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}

export default new DetailRapatKomisDireksidankomiteService();
