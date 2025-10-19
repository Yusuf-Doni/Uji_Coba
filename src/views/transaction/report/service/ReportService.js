import { useAuth } from '@/stores';
import http from '@/service/http/apiBackEnd';
import ExcelJS from 'exceljs';

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

const url = 'report';

class ReportService {
    constructor() {
        this.baseURL = '/api';
        this.url = url;
    }
    // ==========================================
    // REPORT RAPAT KORPORAT (KECUALI RUPS)
    // ==========================================
    
    /**
     * Get report data for corporate meetings (except RUPS)
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response
     */
    async getRapatKorporatReport(filters = {}) {
        try {
            const response = await http.get('/approval-tindak-lanjut/all-export-data', {
                params: filters
            });
            return response;
        } catch (error) {
            console.error('Error fetching corporate meeting report:', error);
            throw error;
        }
    }

    /**
     * Get filtered report data for corporate meetings
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response
     */
    async getRapatKorporatReportFiltered(filters) {
        try {
            const response = await http.get('/report/rapat-korporat/filtered', {
                params: filters
            });
            return response;
        } catch (error) {
            console.error('Error fetching filtered corporate meeting report:', error);
            throw error;
        }
    }

    // ==========================================
    // REPORT RUPS
    // ==========================================
    
    /**
     * Get report data for RUPS meetings
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response
     */
    async getRUPSReport(filters = {}) {
        try {
            const response = await http.get('/approval-tindak-lanjut/all-export-data-rups', {
                params: filters
            });
            return response;
        } catch (error) {
            console.error('Error fetching RUPS report:', error);
            throw error;
        }
    }

    /**
     * Get filtered report data for RUPS meetings
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response
     */
    async getRUPSReportFiltered(filters) {
        try {
            const response = await http.get('/report/rups/filtered', {
                params: filters
            });
            return response;
        } catch (error) {
            console.error('Error fetching filtered RUPS report:', error);
            throw error;
        }
    }

    // ==========================================
    // ENUM/OPTIONS FUNCTIONS
    // ==========================================
    
    /**
     * Get RUPS arahan types from API
     * @returns {Promise} API response with arahan types
     */
    async getRUPSArahanTypes() {
        try {
            const response = await http.get('/jadwalRapat/arahan-rups-enum');
            return response;
        } catch (error) {
            console.error('Error fetching RUPS arahan types:', error);
            throw error;
        }
    }

    // ==========================================
    // EXPORT FUNCTIONS
    // ==========================================
    
    /**
     * Export corporate meeting report to Excel
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response with JSON data for Excel generation
     */
    async exportRapatKorporatToExcel(filters = {}) {
        try {
            const response = await http.get('/approval-tindak-lanjut/all-export-data', {
                params: filters
            });
            return response;
        } catch (error) {
            console.error('Error fetching corporate meeting report data:', error);
            throw error;
        }
    }

    /**
     * Export corporate meeting report to PDF
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response with file blob
     */
    async exportRapatKorporatToPDF(filters = {}) {
        try {
            const response = await http.get('/report/rapat-korporat/export/pdf', {
                params: filters,
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Error exporting corporate meeting report to PDF:', error);
            throw error;
        }
    }

    /**
     * Export RUPS report to Excel
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response with JSON data for Excel generation
     */
    async exportRUPSToExcel(filters = {}) {
        try {
            const response = await http.get('/approval-tindak-lanjut/all-export-data-rups', {
                params: filters
            });
            return response;
        } catch (error) {
            console.error('Error fetching RUPS report data:', error);
            throw error;
        }
    }

    /**
     * Export RUPS report to PDF
     * @param {Object} filters - Filter parameters
     * @returns {Promise} API response with file blob
     */
    async exportRUPSToPDF(filters = {}) {
        try {
            const response = await http.get('/report/rups/export/pdf', {
                params: filters,
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Error exporting RUPS report to PDF:', error);
            throw error;
        }
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    
    /**
     * Download file from blob response
     * @param {Blob} blob - File blob
     * @param {String} filename - Filename for download
     */
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Generate Excel file from JSON data using ExcelJS
     * @param {Array} data - Array of data objects
     * @param {String} filename - Filename for download
     * @param {String} type - Type of report ('corporate' or 'rups')
     */
    async generateExcelFromData(data, filename, type = 'corporate') {
        try {
            
            // Create workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Report');
            
            // Define headers based on report type
            let headers = [];
            if (type === 'corporate') {
                headers = [
                    'No',
                    'Arahan',
                    'PIC',
                    'Action Plan',
                    'Target Waktu',
                    'Progress (%)',
                    'Status Tindak Lanjut',
                    'Link Evidence',
                    'Keterangan'
                ];
            } else if (type === 'rups') {
                headers = [
                    'No',
                    'Jenis Arahan',
                    'Arahan',
                    'PIC',
                    'Action Plan',
                    'Target Waktu',
                    'Progress (%)',
                    'Status Tindak Lanjut',
                    'Link Evidence',
                    'Keterangan'
                ];
            }

            // Set header row with styling
            worksheet.addRow(headers);
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

            // Add data rows
            data.forEach((item, index) => {
                let rowData;
                
                if (type === 'corporate') {
                    rowData = [
                        index + 1,
                        item.arahan || '',
                        item.pic || '',
                        item.actionPlan || '',
                        this.formatDateForDisplay(item.targetWaktu || ''),
                        this.formatProgressForExcel(item.progress || 0),
                        item.statusTindaklanjut || '',
                        item.linkEvidence || '',
                        item.keterangan || ''
                    ];
                } else if (type === 'rups') {
                    rowData = [
                        index + 1,
                        item.arahanTypeDesc || '',
                        item.arahan || '',
                        item.pic || '',
                        item.actionPlan || '',
                        this.formatDateForDisplay(item.targetWaktu || ''),
                        this.formatProgressForExcel(item.progress || 0),
                        item.statusTindaklanjut || '',
                        item.linkEvidence || '',
                        item.keterangan || ''
                    ];
                }

                const row = worksheet.addRow(rowData);
                
                // Style progress column as percentage
                const progressCellIndex = type === 'rups' ? 7 : 6; // Progress column index differs for RUPS vs Corporate
                const progressCell = row.getCell(progressCellIndex);
                progressCell.numFmt = '0%';
                progressCell.alignment = { horizontal: 'center' };
            });

            // Auto-fit columns
            worksheet.columns.forEach((column, index) => {
                if (column.eachCell) {
                    let maxLength = 0;
                    column.eachCell({ includeEmpty: true }, (cell) => {
                        const columnLength = cell.value ? cell.value.toString().length : 10;
                        if (columnLength > maxLength) {
                            maxLength = columnLength;
                        }
                    });
                    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
                }
            });

            // Add borders to all cells
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    if (rowNumber > 1) {
                        cell.alignment = { vertical: 'middle', wrapText: true };
                    }
                });
            });

            // Generate Excel buffer
            const buffer = await workbook.xlsx.writeBuffer();
            
            // Create blob and download
            const blob = new Blob([buffer], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            this.downloadFile(blob, filename);
            
        } catch (error) {
            console.error('Error generating Excel from data:', error);
            throw error;
        }
    }


    /**
     * Format date for display in Excel
     * @param {String} dateString - Date string (ISO format)
     * @returns {String} Formatted date
     */
    formatDateForDisplay(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Format progress for Excel percentage display
     * @param {Number|String} progress - Progress value from API
     * @returns {Number} Formatted progress for Excel (decimal format)
     */
    formatProgressForExcel(progress) {
        if (!progress && progress !== 0) return 0;
        
        const numProgress = Number(progress);
        if (isNaN(numProgress)) return 0;
        
        // If progress is already in percentage format (e.g., 80 for 80%)
        if (numProgress > 1) {
            return numProgress / 100; // Convert to decimal for Excel
        }
        
        // If progress is already in decimal format (e.g., 0.8 for 80%)
        return numProgress;
    }

    /**
     * Format date for API requests
     * @param {Date} date - Date object
     * @returns {String} Formatted date string
     */
    formatDateForAPI(date) {
        if (!date) return null;
        return date.toISOString().split('T')[0];
    }

    /**
     * Build filter parameters for API requests
     * @param {Object} filters - Filter object
     * @returns {Object} Formatted filter parameters
     */
    buildFilterParams(filters) {
        const params = {};
        
        if (filters.search) {
            params.search = filters.search;
        }
        
        if (filters.statusTindakLanjut) {
            params.statusTindakLanjut = filters.statusTindakLanjut;
        }
        
        if (filters.jenisRapatId) {
            params.jenisRapatId = filters.jenisRapatId;
        }
        
        if (filters.tahun) {
            params.tahun = filters.tahun;
        }
        
        if (filters.dateRange && filters.dateRange.length === 2) {
            params.tanggalRapatFrom = this.formatDateForAPI(filters.dateRange[0]);
            params.tanggalRapatTo = this.formatDateForAPI(filters.dateRange[1]);
        }
        
        return params;
    }

    /**
     * Build filter parameters for RUPS API requests
     * @param {Object} filters - Filter object
     * @returns {Object} Formatted filter parameters for RUPS
     */
    buildRUPSFilterParams(filters) {
        const params = {};
        
        // Search parameter (string)
        if (filters.search) {
            params.search = filters.search;
        }
        
        // Status Tindak Lanjut parameter (integer)
        if (filters.statusTindakLanjut) {
            params.statusTindakLanjut = parseInt(filters.statusTindakLanjut) || filters.statusTindakLanjut;
        }
        
        // Arahan RUPS parameter (integer)
        if (filters.arahanRups) {
            params.arahanRups = parseInt(filters.arahanRups) || filters.arahanRups;
        }
        
        // Tahun parameter (integer)
        if (filters.tahun) {
            params.tahun = parseInt(filters.tahun) || filters.tahun;
        }
        
        // Date range parameters (string format)
        if (filters.dateRange && filters.dateRange.length === 2) {
            params.tanggalRapatFrom = this.formatDateForAPI(filters.dateRange[0]);
            params.tanggalRapatTo = this.formatDateForAPI(filters.dateRange[1]);
        }
        
        return params;
    }
}

export default new ReportService();
