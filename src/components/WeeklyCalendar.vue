<template>
  <div class="weekly-calendar bg-white rounded-lg shadow-sm flex">
    <!-- Sidebar - Monthly Schedule List (1/4 width) -->
    <div class="w-1/4 border-r border-gray-200 bg-gray-50">
      <div class="p-4 border-b border-gray-200 bg-white">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center">
          <i class="pi pi-calendar mr-2 text-blue-600"></i>
          Schedule List
        </h2>
        <div v-if="selectedMonth" class="mt-2 text-sm text-gray-600">
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{{ selectedMonth.name }} {{ selectedMonth.year }}</span>
          <span class="ml-2 text-xs text-gray-500">{{ monthlySchedules.length }} schedules</span>
        </div>
      </div>
      
      <!-- Search and Filter -->
      <div v-if="selectedMonth" class="p-3 border-b border-gray-200 bg-gray-50">
        <div class="relative">
          <input 
            v-model="scheduleSearch" 
            type="text" 
            placeholder="Search schedules..." 
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <i class="pi pi-search absolute right-3 top-2.5 text-gray-400 text-sm"></i>
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          <button 
            v-for="service in ['All', 'Haircut', 'Beard Trim', 'Shave', 'Color', 'Massage', 'Waxing']" 
            :key="service"
            @click="selectedService = selectedService === service ? 'All' : service"
            :class="[
              'px-2 py-1 text-xs rounded transition-colors whitespace-nowrap',
              selectedService === service 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]"
          >
            {{ service }}
          </button>
        </div>
      </div>
      
      <!-- Schedule List -->
      <div class="h-full overflow-y-auto" style="height: calc(100vh - 200px);">
        <div v-if="selectedMonth" class="p-4">
          <div v-if="monthlySchedules.length === 0" class="text-center text-gray-500 py-8">
            <i class="pi pi-search text-2xl mb-2"></i>
            <p class="text-sm">No schedules found</p>
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="(dayGroup, day) in groupedSchedules" 
              :key="day"
              class="space-y-2"
            >
              <!-- Day Header -->
              <div class="flex items-center space-x-2 py-2 border-b border-gray-100">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-semibold text-blue-700">{{ day }}</span>
                </div>
                <span class="text-sm font-medium text-gray-700">{{ dayGroup[0].dayName }}</span>
                <span class="text-xs text-gray-500">({{ dayGroup.length }} schedules)</span>
              </div>
              
              <!-- Schedules for this day -->
              <div class="space-y-2 ml-6">
                <div 
                  v-for="appointment in dayGroup" 
                  :key="appointment.id"
                  class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  @click="openScheduleDialog(appointment)"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center"
                           :class="getServiceColor(appointment.service)">
                        <i class="pi pi-calendar text-xs text-white"></i>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-800">{{ appointment.service }}</div>
                        <div class="text-xs text-gray-500">{{ appointment.startdate }} - {{ appointment.enddate }}</div>
                      </div>
                    </div>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">#{{ appointment.id.toString().padStart(4, '0') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-4 text-center text-gray-500">
          <i class="pi pi-calendar text-3xl mb-3"></i>
          <p class="text-sm">Pilih bulan untuk melihat schedule</p>
        </div>
      </div>
    </div>
    
    <!-- Main Content (3/4 width) -->
    <div class="flex-1">
    <!-- Header Section -->
    <div class="calendar-header p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <!-- Left side - Month/Year -->
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-800">{{ currentMonthYear }}</h1>
          <div v-if="selectedMonth && currentView === 'month'" class="ml-2 text-sm text-gray-600">
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ daysInSelectedMonth }} hari</span>
          </div>
          <div v-if="selectedMonth && currentView === 'week'" class="ml-2 text-sm text-gray-600">
            <span class="bg-green-100 text-green-800 px-2 py-1 rounded">Minggu Pertama</span>
            <span class="ml-2 text-xs text-gray-500">{{ getWeekRange() }}</span>
          </div>
          <div v-if="!selectedMonth && currentView === 'month'" class="ml-4 text-sm text-gray-600">
            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pilih bulan untuk melihat data</span>
          </div>
          <div v-if="!selectedMonth && currentView === 'week'" class="ml-4 text-sm text-gray-600">
            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pilih bulan untuk melihat minggu</span>
          </div>
        </div>
        
        <!-- Right side - Navigation and Add New Button -->
        <div class="flex items-center space-x-4">
          <!-- View Navigation -->
          <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 relative">
            <button @click="toggleMonthSelector" class="p-2 hover:bg-gray-200 rounded flex items-center space-x-1 transition-all duration-200 hover:scale-105">
              <i class="pi pi-calendar text-blue-600"></i>
              <i class="pi pi-chevron-down text-blue-600 text-xs"></i>
            </button>
            
            <!-- Month Selector Calendar -->
            <div v-if="showMonthSelector" class="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-96 transform transition-all duration-200 ease-in-out">
              <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <div class="flex items-center justify-between">
                  <h4 class="text-base font-semibold text-gray-800 flex items-center">
                    <i class="pi pi-calendar mr-3 text-blue-600 text-lg"></i>
                    Kalender Bulan
                  </h4>
                  <button @click="toggleMonthSelector" class="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors">
                    <i class="pi pi-times text-lg"></i>
                  </button>
                </div>
              </div>
              
              <!-- Year Navigation -->
              <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div class="flex items-center justify-between">
                  <button @click="previousYear" class="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <i class="pi pi-chevron-left text-gray-600 text-lg"></i>
                  </button>
                  <div class="text-center">
                    <span class="text-xl font-bold text-gray-800">{{ currentYear }}</span>
                    <div class="text-xs text-gray-500 mt-1">
                      Tahun
                      <span v-if="isLeapYear(currentYear)" class="text-blue-600 font-medium">(Kabisat)</span>
                    </div>
                  </div>
                  <button @click="nextYear" class="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <i class="pi pi-chevron-right text-gray-600 text-lg"></i>
                  </button>
                </div>
              </div>
              
              <!-- Month Grid -->
              <div class="p-4">
                <div class="text-xs text-gray-500 text-center mb-3">
                  <i class="pi pi-info-circle mr-1"></i>
                  Klik bulan untuk mengatur filter (berlaku untuk Week & Month view)
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="month in currentYearMonths"
                    :key="`${month.name}-${month.year}`"
                    @click="selectMonth(month)"
                    :class="[
                      'p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105',
                      selectedMonth && selectedMonth.name === month.name && selectedMonth.year === month.year
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700 bg-white hover:bg-gray-50'
                    ]"
                  >
                    <div class="text-center">
                      <div class="text-sm font-semibold mb-2">{{ month.name }}</div>
                      <div class="text-xs text-gray-500 bg-white bg-opacity-70 rounded-full px-2 py-1 inline-block">
                        {{ getDaysInMonth(month) }} hari
                      </div>
                      <div v-if="selectedMonth && selectedMonth.name === month.name && selectedMonth.year === month.year" class="mt-2">
                        <div class="w-2 h-2 bg-purple-500 rounded-full mx-auto"></div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              
              <!-- Footer Info -->
              <div class="p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg">
                <div class="text-xs text-gray-600 text-center">
                  <div class="flex items-center justify-center space-x-4">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                      <span class="font-medium">Filter Aktif</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                      <span>Bulan Tersedia</span>
                    </div>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">
                    <i class="pi pi-calendar mr-1"></i>
                    Total: {{ currentYearMonths.length }} bulan dalam {{ currentYear }}
                  </div>
                </div>
              </div>
            </div>
            <button 
              @click="handleWeekClick"
              :class="[
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                currentView === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Week
            </button>
            <button 
              @click="handleMonthClick"
              :class="[
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                currentView === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Month
            </button>
          </div>
          
          <!-- Add New Button -->
          <button @click="navigateToAddJadwalRapat" class="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
            <i class="pi pi-plus text-sm"></i>
            <span>Add New</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Day Headers -->
      <div class="day-headers grid grid-cols-8 border-b border-gray-200">
        <div class="time-header p-3">
          <div v-if="currentView === 'month'" class="text-sm font-medium text-gray-700">Time</div>
        </div>
        <div 
          v-for="day in weekDays" 
          :key="day.name"
          class="day-header p-3 text-center border-l border-gray-200"
        >
          <div class="text-sm font-medium text-gray-700">
            {{ currentView === 'month' ? day.date : day.name }}
          </div>
          <div v-if="currentView === 'month'" class="text-xs text-gray-500 mt-1">{{ day.name }}</div>
          <div v-else class="text-xs text-gray-500 mt-1">{{ day.date }}</div>
        </div>
      </div>

      <!-- Time Slots Grid -->
      <div class="time-grid">
        <div 
          v-for="timeSlot in timeSlots" 
          :key="timeSlot"
          class="time-row grid grid-cols-8 border-b border-gray-100 relative"
        >
          <!-- Time Label -->
          <div class="time-label p-2 flex items-center">
            <span class="text-xs text-gray-500 font-mono">{{ timeSlot }}</span>
          </div>
          
          <!-- Day Columns -->
          <div 
            v-for="(day, dayIndex) in weekDays" 
            :key="day.name"
            class="day-column p-2 border-l border-gray-100 relative"
          >
            <!-- 30-minute interval line -->
            <div class="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200"></div>
            
            <!-- Appointment Events -->
            <div 
              v-for="appointment in getAppointmentsForTimeSlot(timeSlot, dayIndex)"
              :key="appointment.id"
              :class="[
                'appointment-block p-2 rounded text-xs cursor-pointer transition-all hover:shadow-md',
                getAppointmentColor(appointment.service)
              ]"
              :style="getAppointmentStyle(appointment)"
              @click="openAppointmentDialog(appointment)"
            >
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <img 
                    :src="appointment.avatar" 
                    :alt="appointment.clientName"
                    class="w-5 h-5 rounded-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-800 truncate">
                    #{{ appointment.id.toString().padStart(4, '0') }} {{ appointment.service }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="currentView === 'month'" class="p-6 border-t border-gray-200">
      <div v-if="selectedMonth">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Appointments Data for {{ selectedMonth.name }} {{ selectedMonth.year }}</h3>
          <div class="text-sm text-gray-600">
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">{{ daysInSelectedMonth }} hari dalam bulan ini</span>
            <span class="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Filter Aktif</span>
          </div>
        </div>
        <!-- Filter Info -->
        <div class="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div class="flex items-center text-sm text-purple-700">
            <i class="pi pi-filter mr-2"></i>
            <span class="font-medium">Filter Bulan Aktif:</span>
            <span class="ml-2">{{ selectedMonth.name }} {{ selectedMonth.year }}</span>
            <span class="ml-2 text-xs">(berlaku untuk Week & Month view)</span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="appointment in appointments2" 
            :key="appointment.id"
            class="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-600">ID: #{{ appointment.id.toString().padStart(4, '0') }}</span>
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ appointment.service }}</span>
            </div>
            <div class="space-y-1">
              <div class="text-sm">
                <span class="font-medium text-gray-700">Start Date:</span> 
                <span class="text-gray-600">{{ appointment.startdate }}</span>
              </div>
              <div class="text-sm">
                <span class="font-medium text-gray-700">End Date:</span> 
                <span class="text-gray-600">{{ appointment.enddate }}</span>
              </div>
              <div class="text-sm">
                <span class="font-medium text-gray-700">Day:</span> 
                <span class="text-gray-600">{{ appointment.day }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <div class="text-gray-500">
          <i class="pi pi-calendar text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-700 mb-2">Belum ada bulan yang dipilih</h3>
          <p class="text-sm text-gray-500">Klik tombol kalender di atas untuk memilih bulan dan melihat data appointments</p>
        </div>
      </div>
    </div>
    
    <!-- Week View Info Display -->
    <div v-if="currentView === 'week'" class="p-6 border-t border-gray-200">
      <div v-if="selectedMonth">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Minggu Pertama {{ selectedMonth.name }} {{ selectedMonth.year }}</h3>
          <div class="text-sm text-gray-600">
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">{{ getWeekRange() }}</span>
            <span class="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Filter Aktif</span>
          </div>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center mb-3">
            <i class="pi pi-calendar text-blue-600 mr-2"></i>
            <h4 class="text-md font-medium text-blue-800">Informasi Minggu</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">Tanggal Minggu:</div>
              <div class="text-sm text-gray-600">{{ getWeekRange() }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">Bulan Filter:</div>
              <div class="text-sm text-gray-600">{{ selectedMonth.name }} {{ selectedMonth.year }}</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">Total Hari:</div>
              <div class="text-sm text-gray-600">7 hari (Senin - Minggu)</div>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-700 mb-2">Status:</div>
              <div class="text-sm text-green-600 font-medium">Minggu Aktif</div>
            </div>
          </div>
          
          <!-- Filter Info -->
          <div class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div class="flex items-center text-sm text-purple-700">
              <i class="pi pi-filter mr-2"></i>
              <span class="font-medium">Filter Bulan Aktif:</span>
              <span class="ml-2">{{ selectedMonth.name }} {{ selectedMonth.year }}</span>
              <span class="ml-2 text-xs">(berlaku untuk Week & Month view)</span>
            </div>
          </div>
          
          <!-- Week Days Detail -->
          <div class="mt-4 pt-4 border-t border-blue-200">
            <div class="text-sm font-medium text-gray-700 mb-3">Detail Hari:</div>
            <div class="grid grid-cols-7 gap-2">
              <div 
                v-for="day in weekDays" 
                :key="day.name"
                class="text-center p-2 bg-white rounded border border-gray-200"
              >
                <div class="text-xs font-medium text-gray-600">{{ day.name }}</div>
                <div class="text-sm font-semibold text-gray-800 mt-1">{{ day.date }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <div class="text-gray-500">
          <i class="pi pi-calendar text-4xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-700 mb-2">Belum ada bulan yang dipilih</h3>
          <p class="text-sm text-gray-500">Klik tombol kalender di atas untuk memilih bulan dan melihat minggu pertama</p>
        </div>
      </div>
    </div>
    </div>
  </div>

  <!-- Appointment Detail Dialog -->
  <div v-if="showAppointmentDialog" class="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50" @click="closeAppointmentDialog">
    <div class="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 border border-white border-opacity-50" @click.stop>
      <!-- Dialog Header -->
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 bg-opacity-80 backdrop-blur-sm rounded-t-xl">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center">
            <i class="pi pi-calendar mr-3 text-blue-600"></i>
            Detail Kegiatan
          </h3>
          <button @click="closeAppointmentDialog" class="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors">
            <i class="pi pi-times text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Dialog Content -->
      <div v-if="selectedAppointment" class="p-6">
        <!-- Client Info -->
        <div class="flex items-center space-x-4 mb-6">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
            <img 
              :src="selectedAppointment.avatar" 
              :alt="selectedAppointment.clientName"
              class="w-14 h-14 rounded-full object-cover"
            />
          </div>
          <div>
            <h4 class="text-lg font-semibold text-gray-800">{{ selectedAppointment.clientName }}</h4>
            <!-- <p class="text-sm text-gray-600">Client</p> -->
          </div>
        </div>

        <!-- Appointment Details -->
        <div class="space-y-4">
          <!-- ID & Service -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-2">
              <i class="pi pi-tag text-blue-600"></i>
              <span class="text-sm font-medium text-gray-700">ID Kegiatan:</span>
            </div>
            <span class="text-sm font-semibold text-gray-800">#{{ selectedAppointment.id.toString().padStart(4, '0') }}</span>
          </div>

          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-2">
              <i class="pi pi-cog text-green-600"></i>
              <span class="text-sm font-medium text-gray-700">Jenis Rapat:</span>
            </div>
            <span :class="[
              'text-sm font-semibold px-3 py-1 rounded-full',
              getServiceColor(selectedAppointment.service).replace('bg-', 'bg-').replace('-500', '-100') + ' text-gray-800'
            ]">
              {{ selectedAppointment.service }}
            </span>
          </div>

          <!-- Time Information -->
          <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center space-x-2 mb-2">
              <i class="pi pi-clock text-blue-600"></i>
              <span class="text-sm font-medium text-blue-800">Waktu Kegiatan</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-blue-600 font-medium">Mulai</div>
                <div class="text-sm font-semibold text-blue-800">{{ selectedAppointment.startTime }}</div>
              </div>
              <div>
                <div class="text-xs text-blue-600 font-medium">Selesai</div>
                <div class="text-sm font-semibold text-blue-800">{{ selectedAppointment.endTime }}</div>
              </div>
            </div>
          </div>

          <!-- Day Information -->
          <div class="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div class="flex items-center space-x-2 mb-2">
              <i class="pi pi-calendar text-purple-600"></i>
              <span class="text-sm font-medium text-purple-800">Hari Kegiatan</span>
            </div>
            <div class="text-sm font-semibold text-purple-800">
              {{ weekDays[selectedAppointment.dayIndex]?.name || 'N/A' }}
            </div>
          </div>

          <!-- Duration -->
          <div class="p-3 bg-green-50 rounded-lg border border-green-200">
            <div class="flex items-center space-x-2 mb-2">
              <i class="pi pi-stopwatch text-green-600"></i>
              <span class="text-sm font-medium text-green-800">Durasi</span>
            </div>
            <div class="text-sm font-semibold text-green-800">
              {{ calculateDuration(selectedAppointment.startTime, selectedAppointment.endTime) }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <!-- <div class="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button @click="closeAppointmentDialog" class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <i class="pi pi-times mr-2"></i>
            Tutup
          </button>
          <button class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <i class="pi pi-pencil mr-2"></i>
            Edit
          </button>
        </div> -->
      </div>
    </div>
  </div>

  <!-- Schedule Detail Dialog -->
  <div v-if="showScheduleDialog" class="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50" @click="closeScheduleDialog">
    <div class="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 scale-100 border border-white border-opacity-50" @click.stop>
      <!-- Dialog Header -->
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 bg-opacity-80 backdrop-blur-sm rounded-t-xl">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center">
            <i class="pi pi-calendar mr-3 text-blue-600"></i>
            Detail Jadwal Kegiatan
          </h3>
          <button @click="closeScheduleDialog" class="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded transition-colors">
            <i class="pi pi-times text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Dialog Content -->
      <div v-if="selectedSchedule" class="p-6">
        <div class="space-y-6">
          <!-- ID Kegiatan -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              ID Kegiatan <span class="text-red-600">*</span>
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg">
              #{{ selectedSchedule.id.toString().padStart(4, '0') }}
            </div>
          </div>

          <!-- Jenis Layanan -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              Jenis Layanan <span class="text-red-600">*</span>
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg flex items-center">
              <span>{{ selectedSchedule.service }}</span>
              <div :class="[
                'w-3 h-3 rounded-full ml-auto',
                getServiceColor(selectedSchedule.service)
              ]"></div>
            </div>
          </div>

          <!-- Hari Kegiatan -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              Hari Kegiatan <span class="text-red-600">*</span>
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg flex items-center">
              <span>{{ selectedSchedule.dayName }}</span>
              <i class="pi pi-calendar ml-auto text-gray-400"></i>
            </div>
          </div>

          <!-- Tanggal Kegiatan -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              Tanggal Kegiatan <span class="text-red-600">*</span>
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg flex items-center">
              <span>{{ selectedSchedule.day }} {{ selectedMonth?.name }} {{ selectedMonth?.year }}</span>
              <i class="pi pi-calendar ml-auto text-gray-400"></i>
            </div>
          </div>

          <!-- Waktu Mulai -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              Waktu Mulai <span class="text-red-600">*</span>
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg flex items-center">
              <span>{{ selectedSchedule.startdate }}</span>
              <i class="pi pi-clock ml-auto text-gray-400"></i>
            </div>
          </div>

          <!-- Waktu Selesai -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              Waktu Selesai <span class="text-red-600">*</span>
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg flex items-center">
              <span>{{ selectedSchedule.enddate }}</span>
              <i class="pi pi-clock ml-auto text-gray-400"></i>
            </div>
          </div>

          <!-- Durasi -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              Durasi Kegiatan
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg flex items-center">
              <span>{{ calculateDuration(selectedSchedule.startdate, selectedSchedule.enddate) }}</span>
              <i class="pi pi-stopwatch ml-auto text-gray-400"></i>
            </div>
          </div>

          <!-- Status -->
          <div class="space-y-2">
            <label class="block font-semibold text-gray-700">
              Status Kegiatan
            </label>
            <div class="p-3 bg-white border border-gray-300 rounded-lg flex items-center">
              <span class="text-green-600 font-medium">Terjadwal</span>
              <i class="pi pi-check-circle ml-auto text-green-500"></i>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button @click="closeScheduleDialog" class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <i class="pi pi-times mr-2"></i>
            Tutup
          </button>
          <button class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <i class="pi pi-pencil mr-2"></i>
            Edit Jadwal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const currentView = ref('week');
const selectedMonth = ref(null);
const showMonthSelector = ref(false);
const currentYear = ref(2025);
const scheduleSearch = ref('');
const selectedService = ref('All');

// Dialog state
const showAppointmentDialog = ref(false);
const selectedAppointment = ref(null);
const showScheduleDialog = ref(false);
const selectedSchedule = ref(null);

// Sample data for May 2020 week
const weekDays = ref([
  { name: 'Senin', date: '24 - 05' },
  { name: 'Selasa', date: '25 - 04' },
  { name: 'Rabu', date: '23 - 04' },
  { name: 'Kamis', date: '23 - 04' },
  { name: 'Jumat', date: '23 - 04' },
  { name: 'Sabtu', date: '23 - 04' },
  { name: 'Minggu', date: '23 - 04' }
]);

const monthYear = ref([
    { name: 'Januari', year: '2024' },
    { name: 'Februari', year: '2024' },
    { name: 'Maret', year: '2024' },
    { name: 'April', year: '2024' },
    { name: 'Mei', year: '2024' },
    { name: 'Juni', year: '2024' },
    { name: 'Juli', year: '2024' },
    { name: 'Agustus', year: '2024' },
    { name: 'September', year: '2024' },
    { name: 'Oktober', year: '2024' },
    { name: 'November', year: '2024' },
    { name: 'Desember', year: '2024' },
    { name: 'Januari', year: '2025' },
    { name: 'Februari', year: '2025' },
    { name: 'Maret', year: '2025' },
    { name: 'April', year: '2025' },
    { name: 'Mei', year: '2025' },
    { name: 'Juni', year: '2025' },
    { name: 'Juli', year: '2025' },
    { name: 'Agustus', year: '2025' },
    { name: 'September', year: '2025' },
    { name: 'Oktober', year: '2025' },
    { name: 'November', year: '2025' },
    { name: 'Desember', year: '2025' }
]);

const timeSlots = ref([
  '09.00', '10.00', '11.00', '12.00', '13.00', '14.00', '15.00'
]);

const appointments2 = ref([
    {
        id: 1,
        service: 'Haircut',
        startdate: '1',
        enddate: '1',
        day: 'Senin',
    }
]);


const appointments = ref([
  // Monday
  {
    id: 12,
    service: 'Rapat Direksi',
    startTime: '09.00',
    endTime: '10.30',
    dayIndex: 0,
    avatar: '/demo/images/avatar/stephenshaw.png',
    clientName: 'Rapat Direksi tahun 2025'
  },
  {
    id: 13,
    service: 'Haircut',
    startTime: '12.00',
    endTime: '13.30',
    dayIndex: 0,
    avatar: '/demo/images/avatar/xuxuefeng.png',
    clientName: 'Xu Xuefeng'
  },
  // Tuesday
  {
    id: 10,
    service: 'Beard Trim',
    startTime: '11.00',
    endTime: '12.30',
    dayIndex: 1,
    avatar: '/demo/images/avatar/amyelsner.png',
    clientName: 'Amy Elsner'
  },
  {
    id: 19,
    service: 'Shave',
    startTime: '14.00',
    endTime: '15.00',
    dayIndex: 1,
    avatar: '/demo/images/avatar/annafali.png',
    clientName: 'Anna Fali'
  },
  // Thursday
  {
    id: 20,
    service: 'Color',
    startTime: '10.30',
    endTime: '11.30',
    dayIndex: 3,
    avatar: '/demo/images/avatar/asiyajavayant.png',
    clientName: 'Asiya Javayant'
  },
  {
    id: 21,
    service: 'Massage',
    startTime: '12.00',
    endTime: '13.30',
    dayIndex: 3,
    avatar: '/demo/images/avatar/bernardodominic.png',
    clientName: 'Bernardo Dominic'
  },
  // Friday
  {
    id: 24,
    service: 'Waxing',
    startTime: '13.00',
    endTime: '14.00',
    dayIndex: 4,
    avatar: '/demo/images/avatar/elwinsharvill.png',
    clientName: 'Elwin Sharvill'
  },
  // Saturday
  {
    id: 27,
    service: 'Color',
    startTime: '09.00',
    endTime: '11.00',
    dayIndex: 5,
    avatar: '/demo/images/avatar/ionibowcher.png',
    clientName: 'Ioni Bowcher'
  },
  {
    id: 28,
    service: 'Haircut',
    startTime: '12.00',
    endTime: '13.30',
    dayIndex: 5,
    avatar: '/demo/images/avatar/ivanmagalhaes.png',
    clientName: 'Ivan Magalhaes'
  },
  // Sunday
  {
    id: 30,
    service: 'Waxing',
    startTime: '11.30',
    endTime: '12.30',
    dayIndex: 6,
    avatar: '/demo/images/avatar/onyamalimba.png',
    clientName: 'Onyama Limba'
  }
]);




const currentMonthYear = computed(() => {
  if (selectedMonth.value) {
    return `${selectedMonth.value.name}, ${selectedMonth.value.year}`;
  }
  return 'Mei, 2025';
});

const daysInSelectedMonth = computed(() => {
  if (selectedMonth.value) {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth.value.name);
    const year = parseInt(selectedMonth.value.year);
    return new Date(year, monthIndex + 1, 0).getDate();
  }
  return 0;
});

const currentYearMonths = computed(() => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return monthNames.map(name => ({
    name: name,
    year: currentYear.value.toString()
  }));
});


// Dummy data untuk monthlySchedules
const monthlySchedules = computed(() => {
  if (!selectedMonth.value) return [];
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthIndex = monthNames.indexOf(selectedMonth.value.name);
  const year = parseInt(selectedMonth.value.year);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  const schedules = [];
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, monthIndex, day).getDay();
    const dayName = dayNames[dayOfWeek];
    
    // Create 1-3 schedules per day randomly
    const schedulesPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < schedulesPerDay; i++) {
      const services = ['Haircut', 'Beard Trim', 'Shave', 'Color', 'Massage', 'Waxing'];
      const service = services[Math.floor(Math.random() * services.length)];
      
      // Generate random time slots
      const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      const duration = 30 + Math.floor(Math.random() * 3) * 30; // 30, 60, 90 minutes
      
      const endHour = startHour + Math.floor(duration / 60);
      const endMinute = (startMinute + (duration % 60)) % 60;
      
      schedules.push({
        id: Math.floor(Math.random() * 10000) + 1,
        day: day.toString(),
        dayName: dayName,
        service: service,
        startdate: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
        enddate: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
        date: new Date(year, monthIndex, day)
      });
    }
  }
  
  // Sort by date and time
  let filteredSchedules = schedules.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    return a.startdate.localeCompare(b.startdate);
  });
  
  // Apply service filter
  if (selectedService.value !== 'All') {
    filteredSchedules = filteredSchedules.filter(schedule => 
      schedule.service === selectedService.value
    );
  }
  
  // Apply search filter
  if (scheduleSearch.value.trim()) {
    const searchTerm = scheduleSearch.value.toLowerCase();
    filteredSchedules = filteredSchedules.filter(schedule => 
      schedule.service.toLowerCase().includes(searchTerm) ||
      schedule.dayName.toLowerCase().includes(searchTerm) ||
      schedule.day.includes(searchTerm) ||
      schedule.startdate.includes(searchTerm)
    );
  }
  
  return filteredSchedules;
});

// Dummy data untuk groupedSchedules
const groupedSchedules = computed(() => {
  const groups = {};
  monthlySchedules.value.forEach(schedule => {
    if (!groups[schedule.day]) {
      groups[schedule.day] = [];
    }
    groups[schedule.day].push(schedule);
  });
  return groups;
});

// Function to handle month button click
const handleMonthClick = () => {
  // Set current view to month
  currentView.value = 'month';
  
  // If no month is selected, get random month
  if (!selectedMonth.value) {
    const randomIndex = Math.floor(Math.random() * monthYear.value.length);
    selectedMonth.value = monthYear.value[randomIndex];
  }
  
  // Update weekDays with new dates based on selected month
  updateWeekDays();
};

// Function to handle week button click
const handleWeekClick = () => {
  currentView.value = 'week';
  showMonthSelector.value = false;
  
  // If no month is selected, use current month
  if (!selectedMonth.value) {
    const currentDate = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    selectedMonth.value = {
      name: monthNames[currentDate.getMonth()],
      year: currentDate.getFullYear().toString()
    };
  }
  
  // Update weekDays to show first week of selected month
  updateWeekDaysForWeek();
};

// Function to toggle month selector dropdown
const toggleMonthSelector = () => {
  showMonthSelector.value = !showMonthSelector.value;
};

// Function to select a month from calendar
const selectMonth = (month) => {
  selectedMonth.value = month;
  showMonthSelector.value = false;
  
  // Update weekDays based on current view (keep current view)
  if (currentView.value === 'week') {
    updateWeekDaysForWeek();
  } else if (currentView.value === 'month') {
    updateWeekDays();
  }
};

// Function to navigate to previous year
const previousYear = () => {
  currentYear.value--;
};

// Function to navigate to next year
const nextYear = () => {
  currentYear.value++;
};

// Function to check if year is leap year
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Function to get days in month
const getDaysInMonth = (month) => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthIndex = monthNames.indexOf(month.name);
  const year = parseInt(month.year);
  const days = new Date(year, monthIndex + 1, 0).getDate();
  
  // Add special indicator for leap year February
  if (month.name === 'Februari' && days === 29) {
    return `${days} hari (Kabisat)`;
  }
  
  return `${days} hari`;
};

// Function to get week range for display
const getWeekRange = () => {
  if (selectedMonth.value && currentView.value === 'week' && weekDays.value.length > 0) {
    const firstDay = weekDays.value[0];
    const lastDay = weekDays.value[6];
    return `${firstDay.date} - ${lastDay.date}`;
  }
  return '';
};

// Function to clear filter
const clearFilter = () => {
  selectedMonth.value = null;
  
  // Reset weekDays based on current view
  if (currentView.value === 'week') {
    // Reset to current week
    const currentDate = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    selectedMonth.value = {
      name: monthNames[currentDate.getMonth()],
      year: currentDate.getFullYear().toString()
    };
    updateWeekDaysForWeek();
  } else if (currentView.value === 'month') {
    // Reset to current month
    const currentDate = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    selectedMonth.value = {
      name: monthNames[currentDate.getMonth()],
      year: currentDate.getFullYear().toString()
    };
    updateWeekDays();
  }
};


const updateWeekDaysForWeek = () => {
  if (selectedMonth.value) {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth.value.name);
    const year = parseInt(selectedMonth.value.year);
    
    
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); 
    
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const mondayOfFirstWeek = new Date(firstDayOfMonth);
    mondayOfFirstWeek.setDate(firstDayOfMonth.getDate() - daysToSubtract);
    
    
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    weekDays.value = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(mondayOfFirstWeek);
      currentDate.setDate(mondayOfFirstWeek.getDate() + i);
      
      weekDays.value.push({
        name: dayNames[i],
        date: `${currentDate.getDate().toString().padStart(2, '0')} - ${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`
      });
    }
  }
};


const updateWeekDays = () => {
  if (selectedMonth.value) {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = monthNames.indexOf(selectedMonth.value.name);
    const year = parseInt(selectedMonth.value.year);
    
    // Get the number of days in the selected month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Create weekDays with actual dates for the month
    weekDays.value = [
      { name: 'Senin', date: `1` },
      { name: 'Selasa', date: `2` },
      { name: 'Rabu', date: `3` },
      { name: 'Kamis', date: `4` },
      { name: 'Jumat', date: `5` },
      { name: 'Sabtu', date: `6` },
      { name: 'Minggu', date: `7` }
    ];
    
    
    const newAppointments = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(year, monthIndex, day).getDay();
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      
      newAppointments.push({
        id: Math.floor(Math.random() * 1000) + 1,
        service: ['Haircut', 'Beard Trim', 'Shave', 'Color', 'Massage', 'Waxing'][Math.floor(Math.random() * 6)],
        startdate: day.toString(),
        enddate: day.toString(),
        day: dayNames[dayOfWeek],
        dayIndex: dayOfWeek === 0 ? 6 : dayOfWeek - 1, 
      });
    }
    appointments2.value = newAppointments;
  }
};

const getAppointmentsForTimeSlot = (timeSlot, dayIndex) => {
  return appointments.value.filter(appointment => {
    return appointment.dayIndex === dayIndex && 
           appointment.startTime === timeSlot;
  });
};

const getAppointmentStyle = (appointment) => {
  const startHour = parseInt(appointment.startTime.split('.')[0]);
  const startMinute = parseInt(appointment.startTime.split('.')[1]);
  const endHour = parseInt(appointment.endTime.split('.')[0]);
  const endMinute = parseInt(appointment.endTime.split('.')[1]);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const duration = endMinutes - startMinutes;
  
  // Calculate position within the time slot
  const slotStartMinutes = startHour * 60;
  const offsetInSlot = startMinutes - slotStartMinutes;
  const topOffset = (offsetInSlot / 60) * 100;
  const height = (duration / 60) * 100;
  
  return {
    position: 'absolute',
    top: `${topOffset}%`,
    left: '4px',
    right: '4px',
    height: `${height}%`,
    zIndex: 10
  };
};

const getAppointmentColor = (service) => {
  const colorMap = {
    'Haircut': 'bg-green-100 border-green-200',
    'Beard Trim': 'bg-yellow-100 border-yellow-200',
    'Shave': 'bg-red-100 border-red-200',
    'Color': 'bg-yellow-100 border-yellow-200',
    'Massage': 'bg-green-100 border-green-200',
    'Waxing': 'bg-yellow-100 border-yellow-200'
  };
  return colorMap[service] || 'bg-gray-100 border-gray-200';
};

const getServiceColor = (service) => {
  const colorMap = {
    'Haircut': 'bg-green-500',
    'Beard Trim': 'bg-yellow-500',
    'Shave': 'bg-red-500',
    'Color': 'bg-orange-500',
    'Massage': 'bg-blue-500',
    'Waxing': 'bg-purple-500'
  };
  return colorMap[service] || 'bg-gray-500';
};

// Close dropdown when clicking outside
const closeDropdownOnOutsideClick = (event) => {
  const monthSelector = event.target.closest('.relative');
  const calendarButton = event.target.closest('button');
  
  // If clicked outside the month selector and not on the calendar button
  if (!monthSelector && !calendarButton && showMonthSelector.value) {
    showMonthSelector.value = false;
  }
};

// Function to navigate to add jadwal rapat page
const navigateToAddJadwalRapat = () => {
  router.push('/transaction/jadwal-rapat-korporat/add');
};

// Function to open appointment detail dialog
const openAppointmentDialog = (appointment) => {
  selectedAppointment.value = appointment;
  showAppointmentDialog.value = true;
};

// Function to close appointment detail dialog
const closeAppointmentDialog = () => {
  showAppointmentDialog.value = false;
  selectedAppointment.value = null;
};

// Function to calculate duration between start and end time
const calculateDuration = (startTime, endTime) => {
  const start = startTime.split(':');
  const end = endTime.split(':');
  
  const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  
  const durationMinutes = endMinutes - startMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  } else {
    return `${minutes} menit`;
  }
};

// Function to open schedule detail dialog
const openScheduleDialog = (schedule) => {
  selectedSchedule.value = schedule;
  showScheduleDialog.value = true;
};

// Function to close schedule detail dialog
const closeScheduleDialog = () => {
  showScheduleDialog.value = false;
  selectedSchedule.value = null;
};

// Add event listener when component is mounted
onMounted(() => {
  document.addEventListener('click', closeDropdownOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOnOutsideClick);
});

</script>

<style scoped>
.weekly-calendar {
  height: calc(100vh - 2rem);
  overflow: hidden;
}

.calendar-grid {
  height: calc(100% - 80px);
  overflow-y: auto;
}

.time-row {
  height: 60px;
}

.day-column {
  position: relative;
}

.appointment-block {
  border: 1px solid;
}

/* Custom scrollbar */
.calendar-grid::-webkit-scrollbar {
  width: 6px;
}

.calendar-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.calendar-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.calendar-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
