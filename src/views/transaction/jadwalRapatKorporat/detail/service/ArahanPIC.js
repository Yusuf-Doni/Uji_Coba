import { useAuth } from '@/stores/authStore';
import http from '@/service/http/apiBackEnd';

const url = 'arahanRapat';

class ArahanPICService {
    constructor() {
        this.url = url;
    }

    /**
     * Get list arahan rapat by jadwal rapat ID sesuai dengan Swagger API
     * @param {string} jadwalRapatId - ID jadwal rapat (UUID)
     * @returns {Promise} Response dari server berisi list arahan rapat
     */
    getArahanRapatListByJadwalRapatId(jadwalRapatId) {
        const requestUrl = `/${this.url}/getByJadwalRapat/${jadwalRapatId}`;
        
        // console.log('=== ARAHAN PIC API CALL ===');
        // console.log('Request URL:', requestUrl);
        // console.log('Full URL will be:', http.defaults.baseURL + requestUrl);
        
        return http.get(requestUrl)
            .then(response => {
                // console.log('Arahan Rapat List response:', response);
                return response;
            })
            .catch(error => {
                console.error('Arahan Rapat List error:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    url: error.config?.url,
                    method: error.config?.method,
                    fullUrl: error.config?.baseURL + error.config?.url
                });
                throw error;
            });
    }

}

export default new ArahanPICService();
