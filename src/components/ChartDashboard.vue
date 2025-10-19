<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Chart from 'primevue/chart';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import DashboardService from '@/service/DashboardService';

// Toast service
const toast = useToast();

// Chart visibility state - default terbuka
const isVisible = ref(true);
const isLoading = ref(false);

// Chart data
const horizontalBarData = ref({});
const radarData = ref({});
const multiLineData1 = ref({});
const multiLineData2 = ref({});

// Chart options
const horizontalBarOptions = ref({});
const radarOptions = ref({});
const multiLineOptions1 = ref({});
const multiLineOptions2 = ref({});

// Toggle chart visibility
const toggleCharts = async () => {
    if (isVisible.value) {
        isVisible.value = false;
    } else {
        isLoading.value = true;
        isVisible.value = true;
        
        try {
            // Load chart data from service
            await loadChartData();
        } catch (error) {
            console.error('Error loading chart data:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load chart data',
                life: 3000
            });
        } finally {
            isLoading.value = false;
        }
    }
};

// Load chart data from DashboardService
const loadChartData = async () => {
    try {
        // Load all chart data in parallel
        const [horizontalBar, radar, multiLine1, multiLine2] = await Promise.all([
            DashboardService.getHorizontalBarData(),
            DashboardService.getRadarData(),
            DashboardService.getMultiLineData1(),
            DashboardService.getMultiLineData2()
        ]);

        // Set chart data
        horizontalBarData.value = horizontalBar;
        radarData.value = radar;
        multiLineData1.value = multiLine1;
        multiLineData2.value = multiLine2;

        // Initialize chart options
        initChartOptions();
    } catch (error) {
        console.error('Error loading charts:', error);
        throw error;
    }
};

// Initialize chart options
const initChartOptions = () => {
    // Horizontal Bar Chart Options
    horizontalBarOptions.value = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Capaian Per Parameter',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20
                },
                title: {
                    display: true,
                    text: 'Capaian (%)'
                }
            },
            y: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    // Radar Chart Options
    radarOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Radar Chart Per Aspek',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                subtitle: {
                    display: true,
                    text: 'Dewan Komisaris/Pengawas',
                    font: {
                        size: 12
                    }
                }
            }
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20
                }
            }
        }
    };

    // Multi-Line Chart 1 Options
    multiLineOptions1.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Data Sirkuler',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 300,
                ticks: {
                    stepSize: 50
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };

    // Multi-Line Chart 2 Options
    multiLineOptions2.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'BOBOT/SKOR/CAPAIAN',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 150,
                ticks: {
                    stepSize: 50
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };
};

onMounted(async () => {
    console.log('ChartDashboard mounted');
    // Load chart data immediately since default is visible
    isLoading.value = true;
    try {
        await loadChartData();
    } catch (error) {
        console.error('Error loading chart data on mount:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load chart data',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
});

onUnmounted(() => {
    // Cleanup if needed
});
</script>

<template>
    <!-- Charts Container - Selalu Tampil -->
    <div class="chart-dashboard" :class="{ 'loading': isLoading, 'collapsed': !isVisible }">
        <div class="dashboard-header">
            <h2 class="dashboard-title">
                <i class="pi pi-chart-bar mr-2"></i>
                Chart Untuk GCG
            </h2>
            <Button 
                :icon="isVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                @click="toggleCharts"
                :loading="isLoading"
                class="toggle-btn"
                :class="{ 'active': isVisible }"
                size="small"
                text
                rounded
            />
        </div>
        
        <!-- Content yang bisa di-hide -->
        <div v-if="isVisible">
            <div v-if="isLoading" class="loading-container">
                <div class="loading-spinner">
                    <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
                    <p class="mt-4 text-gray-600">Loading chart data...</p>
                </div>
            </div>

            <div v-else class="charts-grid">
            <!-- Top Left - Horizontal Bar Chart -->
            <div class="chart-container">
                <div class="chart-wrapper">
                    <Chart 
                        v-if="horizontalBarData.labels && horizontalBarData.labels.length > 0"
                        type="bar" 
                        :data="horizontalBarData" 
                        :options="horizontalBarOptions"
                        class="chart"
                    />
                    <div v-else class="chart-placeholder">
                            <i class="pi pi-chart-bar text-4xl text-gray-400 mb-4"></i>
                            <p>No data available</p>
                    </div>
                </div>
            </div>

            <!-- Top Right - Radar Chart -->
            <div class="chart-container">
                <div class="chart-wrapper">
                    <Chart 
                            v-if="radarData.labels && radarData.labels.length > 0"
                        type="radar" 
                        :data="radarData" 
                        :options="radarOptions"
                        class="chart"
                    />
                        <div v-else class="chart-placeholder">
                            <i class="pi pi-chart-line text-4xl text-gray-400 mb-4"></i>
                            <p>No data available</p>
                        </div>
                </div>
            </div>

            <!-- Bottom Left - Multi-Line Chart 1 -->
            <div class="chart-container">
                <div class="chart-wrapper">
                    <Chart 
                            v-if="multiLineData1.labels && multiLineData1.labels.length > 0"
                        type="line" 
                        :data="multiLineData1" 
                        :options="multiLineOptions1"
                        class="chart"
                    />
                        <div v-else class="chart-placeholder">
                            <i class="pi pi-chart-line text-4xl text-gray-400 mb-4"></i>
                            <p>No data available</p>
                        </div>
                </div>
            </div>

            <!-- Bottom Right - Multi-Line Chart 2 -->
            <div class="chart-container">
                <div class="chart-wrapper">
                    <Chart 
                            v-if="multiLineData2.labels && multiLineData2.labels.length > 0"
                        type="line" 
                        :data="multiLineData2" 
                        :options="multiLineOptions2"
                        class="chart"
                    />
                        <div v-else class="chart-placeholder">
                            <i class="pi pi-chart-line text-4xl text-gray-400 mb-4"></i>
                            <p>No data available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Component -->
    <Toast />
</template>

<style scoped>
/* Toggle Button dalam Header */
.toggle-btn {
    width: 32px;
    height: 32px;
    background-color: transparent !important;
    border: none !important;
    color: #6b7280 !important;
    transition: all 0.2s ease;
    border-radius: 6px;
}

.toggle-btn:hover {
    background-color: #f3f4f6 !important;
    color: #374151 !important;
}

.toggle-btn.active {
    background-color: #e5e7eb !important;
    color: #1f2937 !important;
}

.toggle-btn.active:hover {
    background-color: #d1d5db !important;
}

/* Icon styling */
.toggle-btn .p-button-icon {
    font-size: 14px;
}

/* Charts Dashboard */
.chart-dashboard {
    background-color: #f8fafc;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
    transition: all 0.3s ease;
}

.chart-dashboard.loading {
    opacity: 0.7;
}

.chart-dashboard.collapsed {
    padding: 15px 20px;
    margin: 10px 0;
}

.chart-dashboard.collapsed .dashboard-header {
    margin-bottom: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #e2e8f0;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
}

.dashboard-title {
    font-size: 24px;
    font-weight: bold;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
}

/* Loading Container */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.loading-spinner {
    text-align: center;
    padding: 40px;
}

.charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.chart-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    min-height: 400px;
}

.chart-wrapper {
    position: relative;
    height: 350px;
    width: 100%;
}

.chart {
    width: 100% !important;
    height: 100% !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .charts-grid {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(4, 1fr);
    }
    
    .chart-container {
        min-height: 350px;
    }
    
    .chart-wrapper {
        height: 300px;
    }
}

@media (max-width: 768px) {
    .chart-dashboard {
        padding: 15px;
        margin: 10px 0;
    }
    
    .dashboard-title {
        font-size: 20px;
    }
    
    .chart-container {
        padding: 15px;
        min-height: 300px;
    }
    
    .chart-wrapper {
        height: 250px;
    }
    
}

/* Chart specific styling */
:deep(.p-chart) {
    width: 100% !important;
    height: 100% !important;
}

:deep(.p-chart canvas) {
    width: 100% !important;
    height: 100% !important;
}

.chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 20px;
}
</style>
