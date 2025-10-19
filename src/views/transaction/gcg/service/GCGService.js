import { useAuth } from '@/stores';
import http from '@/service/http/apiBackEnd';

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
                authStore.logout().finally(() => {
                    location.href = '/auth/login';
                });
            }
        }
        return Promise.reject(error);
    }
);

const url = 'gcg';

class GCGService {
    constructor() {
        this.url = url;
        this.useMockData = true; // Set to false when real API is available
    }

    // Helper method to simulate API delay
    async simulateDelay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper method to load mock JSON data
    async loadMockData(filename) {
        try {
            const response = await fetch(`/demo/data/${filename}`);
            return await response.json();
        } catch (error) {
            console.error(`Error loading mock data ${filename}:`, error);
            return {
                code: 500,
                message: 'Error loading mock data',
                data: null
            };
        }
    }

    // Get GCG implementations with dynamic parameter structure
    async get(params, url = this.url) {
        if (this.useMockData) {
            await this.simulateDelay();
            // Use dynamic parameter data instead of static hierarchical data
            const mockData = await this.loadMockData('gcg-dynamic-demo.json');
            
            // Convert dynamic parameter structure to flat list for table display
            const flatData = [];
            mockData.data.forEach(gcgItem => {
                // Add main GCG item
                flatData.push({
                    id: gcgItem.id,
                    no: 'GCG',
                    kriteriaDescription: gcgItem.namaImplementasi,
                    bobot: gcgItem.parameterStructure?.reduce((sum, param) => sum + (parseFloat(param.bobot) || 0), 0).toFixed(3),
                    subFaktorLevel2: '-',
                    subFaktorLevel1: '-',
                    faktor: '1.000',
                    skorParameter: '-',
                    skorIndikator: '-',
                    skorAspek: gcgItem.parameterStructure?.reduce((sum, param) => sum + (parseFloat(param.bobot) || 0), 0).toFixed(3),
                    capaianPercent: this.calculateAverageCompletion(gcgItem.parameterStructure),
                    uraianPemenuhan: gcgItem.deskripsi,
                    dokumenCount: this.countEvidence(gcgItem.id),
                    pic: this.getMainPIC(gcgItem.parameterStructure),
                    status: gcgItem.status,
                    level: 0,
                    parentId: null,
                    aspectId: gcgItem.aspectId,
                    parameterId: null,
                    namaImplementasi: gcgItem.namaImplementasi,
                    tahun: gcgItem.tahun,
                    deskripsi: gcgItem.deskripsi,
                    parameterStructure: gcgItem.parameterStructure
                });
                
                // Flatten parameter structure for hierarchical display
                this.flattenParameterStructure(gcgItem.parameterStructure || [], flatData, gcgItem.id);
            });
            
            // Apply filtering
            let filteredData = flatData;
            
            if (params.search) {
                filteredData = filteredData.filter(item => 
                    item.kriteriaDescription.toLowerCase().includes(params.search.toLowerCase()) ||
                    item.status.toLowerCase().includes(params.search.toLowerCase()) ||
                    item.namaImplementasi.toLowerCase().includes(params.search.toLowerCase())
                );
            }
            
            if (params.aspect) {
                filteredData = filteredData.filter(item => 
                    item.kriteriaDescription.toLowerCase().includes(params.aspect.toLowerCase())
                );
            }
            
            if (params.status) {
                filteredData = filteredData.filter(item => 
                    item.status.toLowerCase().includes(params.status.toLowerCase())
                );
            }
            
            // Simulate pagination
            const startIndex = (params.page || 0) * (params.size || 10);
            const endIndex = startIndex + (params.size || 10);
            const paginatedData = filteredData.slice(startIndex, endIndex);
            
            return {
                data: {
                    ...mockData,
                    data: paginatedData,
                    totalElement: filteredData.length
                }
            };
        }
        
        return http.get(`/${url}`, {
            params: params
        });
    }

    // Get GCG implementation by ID
    async getById(id) {
        if (this.useMockData) {
            await this.simulateDelay();
            const mockData = await this.loadMockData('gcg-dynamic-demo.json');
            const item = mockData.data.find(item => item.id === id);
            
            return {
                data: {
                    code: 200,
                    message: 'Success',
                    data: item || null
                }
            };
        }
        
        return http.get(`/${this.url}/${id}`);
    }

    // Create new GCG implementation
    async post(data, url = this.url) {
        if (this.useMockData) {
            await this.simulateDelay();
            return {
                data: {
                    code: 200,
                    message: 'Data berhasil disimpan',
                    data: { ...data, id: `gcg-${Date.now()}` }
                }
            };
        }
        
        return http.post(`/${url}`, data);
    }

    // Update GCG implementation
    async put(id, data, url = this.url) {
        if (this.useMockData) {
            await this.simulateDelay();
            return {
                data: {
                    code: 200,
                    message: 'Data berhasil diperbarui',
                    data: { ...data, id }
                }
            };
        }
        
        return http.put(`/${url}/${id}`, data);
    }

    // Delete GCG implementation
    async delete(id, url = this.url) {
        if (this.useMockData) {
            await this.simulateDelay();
            return {
                data: {
                    code: 200,
                    message: 'Data berhasil dihapus',
                    data: { id }
                }
            };
        }
        
        return http.delete(`/${url}/${id}`);
    }

    // Get aspects for dropdown
    async getAspects() {
        if (this.useMockData) {
            await this.simulateDelay();
            return await this.loadMockData('gcg-aspects.json');
        }
        
        return http.get(`/${this.url}/aspects`);
    }

    // Get parameters by aspect
    async getParameters(aspectId) {
        if (this.useMockData) {
            await this.simulateDelay();
            const mockData = await this.loadMockData('gcg-parameters.json');
            return {
                data: mockData[aspectId] || { code: 200, message: 'Success', data: [] }
            };
        }
        
        return http.get(`/${this.url}/parameters/${aspectId}`);
    }

    // Get sub-parameters by parameter
    async getSubParameters(parameterId) {
        if (this.useMockData) {
            await this.simulateDelay();
            const mockData = await this.loadMockData('gcg-sub-parameters.json');
            return {
                data: mockData[parameterId] || { code: 200, message: 'Success', data: [] }
            };
        }
        
        return http.get(`/${this.url}/sub-parameters/${parameterId}`);
    }

    // Get actions for parameter
    async getActions(parameterId) {
        if (this.useMockData) {
            await this.simulateDelay();
            const mockData = await this.loadMockData('gcg-actions.json');
            return {
                data: mockData[parameterId] || { code: 200, message: 'Success', data: [] }
            };
        }
        
        return http.get(`/${this.url}/actions/${parameterId}`);
    }

    // Upload evidence file
    async uploadEvidence(gcgId, parameterId, file) {
        if (this.useMockData) {
            await this.simulateDelay(2000); // Longer delay for file upload simulation
            return {
                data: {
                    code: 200,
                    message: 'File berhasil diupload',
                    data: {
                        id: `evid-${Date.now()}`,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.name.split('.').pop(),
                        uploadedAt: new Date().toISOString(),
                        gcgId,
                        parameterId
                    }
                }
            };
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('gcgId', gcgId);
        formData.append('parameterId', parameterId);
        
        return http.post(`/${this.url}/evidence/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // Delete evidence
    async deleteEvidence(evidenceId) {
        if (this.useMockData) {
            await this.simulateDelay();
            return {
                data: {
                    code: 200,
                    message: 'Evidence berhasil dihapus',
                    data: { id: evidenceId }
                }
            };
        }
        
        return http.delete(`/${this.url}/evidence/${evidenceId}`);
    }

    // Get evidence by GCG implementation
    async getEvidence(gcgId) {
        if (this.useMockData) {
            await this.simulateDelay();
            const mockData = await this.loadMockData('gcg-evidence.json');
            return {
                data: mockData[gcgId] || { code: 200, message: 'Success', data: [] }
            };
        }
        
        return http.get(`/${this.url}/evidence/${gcgId}`);
    }

    // Save self-assessment score
    async saveScore(gcgId, parameterId, scoreData) {
        if (this.useMockData) {
            await this.simulateDelay();
            return {
                data: {
                    code: 200,
                    message: 'Skor berhasil disimpan',
                    data: {
                        gcgId,
                        parameterId,
                        ...scoreData,
                        lastUpdated: new Date().toISOString()
                    }
                }
            };
        }
        
        return http.post(`/${this.url}/score`, {
            gcgId,
            parameterId,
            ...scoreData
        });
    }

    // Get self-assessment scores
    async getScores(gcgId) {
        if (this.useMockData) {
            await this.simulateDelay();
            const mockData = await this.loadMockData('gcg-scores.json');
            return {
                data: mockData[gcgId] || { code: 200, message: 'Success', data: [] }
            };
        }
        
        return http.get(`/${this.url}/scores/${gcgId}`);
    }

    // Get GCG report
    async getReport(gcgId) {
        if (this.useMockData) {
            await this.simulateDelay();
            const mockData = await this.loadMockData('gcg-report.json');
            return {
                data: mockData[gcgId] || { code: 200, message: 'Success', data: null }
            };
        }
        
        return http.get(`/${this.url}/report/${gcgId}`);
    }

    // Get divisions for PIC dropdown
    async getDivisions() {
        if (this.useMockData) {
            await this.simulateDelay();
            return await this.loadMockData('gcg-divisions.json');
        }
        
        return http.get(`/${this.url}/divisions`);
    }

    // Helper methods for dynamic parameter processing
    flattenParameterStructure(parameters, flatData, gcgId, parentId = null) {
        parameters.forEach((param, index) => {
            const flatItem = {
                id: `${gcgId}-${param.id}`,
                no: this.generateNumber(param.level, index + 1),
                kriteriaDescription: param.nama,
                bobot: param.bobot || '0.000',
                subFaktorLevel2: param.subFaktorLevel2 || '-',
                subFaktorLevel1: param.subFaktorLevel1 || '-',
                faktor: param.faktor || '1.000',
                skorParameter: this.calculateParameterScore(param),
                skorIndikator: this.calculateIndicatorScore(param),
                skorAspek: this.calculateAspectScore(param),
                capaianPercent: this.calculateParameterCompletion(param),
                uraianPemenuhan: param.uraianPemenuhan || '',
                dokumenCount: this.countParameterEvidence(param.id),
                pic: param.pic || '',
                status: param.status || 'Not Started',
                level: param.level,
                parentId: parentId,
                aspectId: null,
                parameterId: param.id,
                namaImplementasi: null,
                tahun: null,
                deskripsi: param.deskripsi || '',
                parameterStructure: null
            };
            
            flatData.push(flatItem);
            
            // Recursively add children
            if (param.children && param.children.length > 0) {
                this.flattenParameterStructure(param.children, flatData, gcgId, param.id);
            }
        });
    }

    generateNumber(level, index) {
        const levelIndicators = ['', '', '(', 'a.', '(a)'];
        if (level <= 1) return index.toString();
        if (level === 2) return `(${index})`;
        if (level === 3) return `${String.fromCharCode(96 + index)}.`;
        if (level === 4) return `(${String.fromCharCode(96 + index)})`;
        return index.toString();
    }

    calculateAverageCompletion(parameterStructure) {
        if (!parameterStructure || parameterStructure.length === 0) return '0%';
        
        const allParams = [];
        const flattenParams = (params) => {
            params.forEach(param => {
                allParams.push(param);
                if (param.children) {
                    flattenParams(param.children);
                }
            });
        };
        
        flattenParams(parameterStructure);
        
        const completedParams = allParams.filter(param => param.status === 'Selesai').length;
        const completionPercent = Math.round((completedParams / allParams.length) * 100);
        
        return `${completionPercent}%`;
    }

    calculateParameterCompletion(param) {
        const statusMap = {
            'Selesai': '100%',
            'In Progress': '60%',
            'Not Started': '0%'
        };
        return statusMap[param.status] || '0%';
    }

    calculateParameterScore(param) {
        const baseScore = parseFloat(param.bobot) || 0;
        const factor = parseFloat(param.faktor) || 1;
        return (baseScore * factor).toFixed(3);
    }

    calculateIndicatorScore(param) {
        if (param.level === 1) {
            return this.calculateParameterScore(param);
        }
        return '-';
    }

    calculateAspectScore(param) {
        if (param.level === 1) {
            return this.calculateParameterScore(param);
        }
        return '-';
    }

    countEvidence(gcgId) {
        // Simulate evidence count based on GCG ID
        const evidenceCount = {
            'gcg-demo-001': 15,
            'gcg-demo-002': 8,
            'gcg-dynamic-001': 12,
            'gcg-dynamic-002': 5
        };
        return evidenceCount[gcgId] || 0;
    }

    countParameterEvidence(parameterId) {
        // Simulate evidence count per parameter
        return Math.floor(Math.random() * 5) + 1;
    }

    getMainPIC(parameterStructure) {
        if (!parameterStructure || parameterStructure.length === 0) return '';
        
        // Get PIC from first parameter
        const firstParam = parameterStructure[0];
        return firstParam.pic || '';
    }
}

export default new GCGService();
