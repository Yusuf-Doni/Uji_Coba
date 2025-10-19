import TransactionMainService from './base/TransactionMainService';

const url = 'dashboard';

class DashboardService extends TransactionMainService {
    constructor() {
        super(url);
    }

    overview(data) {
        return this.get(data, `${url}/overview`);
    }

    overviewRealisasiKontrak(data) {
        return this.get(data, `${url}/overview-realisasi-kontrak`);
    }

    overviewNakerKontrak(data) {
        return this.get(data, `${url}/overview-naker-kontrak`);
    }

    // Chart data methods
    getHorizontalBarData() {
        // Simulate API call with dummy data
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    labels: [
                        'Audit Internal berjalan',
                        'Program CSR',
                        'Kebijakan Risiko',
                        'Laporan Transparansi',
                        'Whistle Blowing aktif',
                        'Pengendalian Gratifikasi',
                        'LHKPN dilaporkan',
                        'Pengukuran Penerapan GCG',
                        'Code of Conduct dilaksanakan',
                        'Pedoman GCG tersedia'
                    ],
                    datasets: [
                        {
                            label: 'Capaian (%)',
                            backgroundColor: '#FF8C00',
                            borderColor: '#FF8C00',
                            data: [90, 85, 60, 70, 95, 90, 85, 95, 50, 80]
                        }
                    ]
                });
            }, 300);
        });
    }

    getRadarData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    labels: [
                        'Direksi',
                        'Pemegang Saham & RUPS',
                        'Komitmen Tata Kelola Beri',
                        'CSR & Keberlanjutan',
                        'Manajemen Risiko',
                        'Audit Internal',
                        'Aspek Lainnya',
                        'Pengungkapan Informasi & Transparansi'
                    ],
                    datasets: [
                        {
                            label: 'Dewan Komisaris/Pengawas',
                            backgroundColor: 'rgba(255, 140, 0, 0.3)',
                            borderColor: '#FF8C00',
                            pointBackgroundColor: '#FF8C00',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#FF8C00',
                            data: [85, 70, 60, 75, 70, 75, 80, 85]
                        }
                    ]
                });
            }, 300);
        });
    }

    getMultiLineData1() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    labels: [
                        'Komitmen Tata Kelola',
                        'Pemegang Saham & RUPS',
                        'Dewan Komisaris/Pengawas',
                        'Direksi',
                        'Pengungkapan Informasi &',
                        'Aspek Lainnya',
                        'TOTAL'
                    ],
                    datasets: [
                        {
                            label: 'Line 1',
                            data: [70, 50, 160, 100, 80, 70, 250],
                            borderColor: '#8B5CF6',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Line 2',
                            data: [30, 20, 70, 50, 40, 30, 180],
                            borderColor: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Line 3',
                            data: [20, 10, 50, 30, 20, 10, 120],
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        }
                    ]
                });
            }, 300);
        });
    }

    getMultiLineData2() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    labels: [
                        'Pedoman GCG tersedia',
                        'Code of Conduct dilaksanakan',
                        'Pengukuran Penerapan GCG',
                        'LHKPN dilaporkan',
                        'Pengendalian Gratifikasi',
                        'Whistle Blowing aktif'
                    ],
                    datasets: [
                        {
                            label: 'BOBOT',
                            data: [50, 20, 40, 20, 40, 20],
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'SKOR',
                            data: [50, 20, 40, 20, 40, 20],
                            borderColor: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'CAPAIAN (%)',
                            data: [50, 40, 100, 80, 100, 80],
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4
                        }
                    ]
                });
            }, 300);
        });
    }

}

export default new DashboardService();
