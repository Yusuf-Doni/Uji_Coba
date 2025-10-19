<script setup>
defineProps({
    parameter: {
        type: Object,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    onAddSub: {
        type: Function,
        required: true
    },
    onAddSubSub: {
        type: Function,
        required: true
    },
    onAddSubSubSub: {
        type: Function,
        required: true
    },
    onRemove: {
        type: Function,
        required: true
    },
    getLevelLabel: {
        type: Function,
        required: true
    },
    getLevelIcon: {
        type: Function,
        required: true
    },
    getLevelColor: {
        type: Function,
        required: true
    },
    getPadding: {
        type: Function,
        required: true
    },
    subFaktorOptions: {
        type: Array,
        required: true
    },
    statusOptions: {
        type: Array,
        required: true
    },
    divisions: {
        type: Array,
        required: true
    },
    selectedFiles: {
        type: Object,
        default: () => ({})
    },
    onFileSelect: {
        type: Function,
        default: () => {}
    },
    removeFile: {
        type: Function,
        default: () => {}
    },
    getFileIcon: {
        type: Function,
        default: () => 'pi pi-file'
    },
    formatFileSize: {
        type: Function,
        default: () => '0 Bytes'
    },
    allowedFileTypes: {
        type: Array,
        default: () => []
    },
    maxFileSize: {
        type: Number,
        default: 10485760
    }
});

const emit = defineEmits(['update:parameter']);
</script>

<template>
    <div :class="`${getPadding(level)} border-l-2 pl-4`" 
         :style="{ borderLeftColor: level === 1 ? '#3b82f6' : level === 2 ? '#10b981' : level === 3 ? '#f59e0b' : '#ef4444' }">
        
        <!-- Parameter Header -->
        <div class="flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm">
            <div class="flex items-center gap-3">
                <i :class="`${getLevelIcon(level)} text-xl`" :style="{ color: level === 1 ? '#3b82f6' : level === 2 ? '#10b981' : level === 3 ? '#f59e0b' : '#ef4444' }"></i>
                <div>
                    <span class="font-semibold text-lg" :style="{ color: level === 1 ? '#3b82f6' : level === 2 ? '#10b981' : level === 3 ? '#f59e0b' : '#ef4444' }">
                        {{ getLevelLabel(level) }}
                    </span>
                    <div class="text-sm text-gray-500" v-if="parameter.nama">
                        {{ parameter.nama }}
                    </div>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <!-- Add Sub Parameter Buttons -->
                <div class="flex gap-1">
                    <Button
                        v-if="level < 4"
                        :icon="level === 1 ? 'pi pi-plus' : level === 2 ? 'pi pi-plus' : 'pi pi-plus'"
                        :severity="level === 1 ? 'info' : level === 2 ? 'success' : 'warning'"
                        size="small"
                        text
                        rounded
                        :label="`+ ${getLevelLabel(level + 1)}`"
                        @click="level === 1 ? onAddSub(parameter.id) : level === 2 ? onAddSubSub(parameter.id) : onAddSubSubSub(parameter.id)"
                        v-tooltip.bottom="`Tambah ${getLevelLabel(level + 1)}`"
                    />
                </div>
                
                <!-- Remove Button -->
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    rounded
                    @click="onRemove(parameter.id)"
                    v-tooltip.bottom="'Hapus Parameter'"
                />
            </div>
        </div>
        
        <!-- Parameter Form Fields -->
        <div class="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <!-- Basic Info Row -->
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-8">
                    <label class="block font-medium mb-2">
                        Nama {{ getLevelLabel(level) }} <span class="text-red-500">(*)</span>
                    </label>
                    <InputText
                        v-model:model-value="parameter.nama"
                        :placeholder="`Masukkan nama ${getLevelLabel(level).toLowerCase()}`"
                        class="w-full"
                    />
                </div>
                <div class="col-span-4">
                    <label class="block font-medium mb-2">Status</label>
                    <Dropdown
                        v-model:model-value="parameter.status"
                        :options="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Pilih Status"
                        class="w-full"
                    />
                </div>
            </div>
            
            <!-- Description Row -->
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label class="block font-medium mb-2">Deskripsi</label>
                    <Textarea
                        v-model:model-value="parameter.deskripsi"
                        rows="2"
                        autoResize
                        :placeholder="`Deskripsi ${getLevelLabel(level).toLowerCase()}`"
                        class="w-full"
                    />
                </div>
            </div>
            
            <!-- Scoring Row -->
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-3">
                    <label class="block font-medium mb-2">Bobot</label>
                    <InputNumber
                        v-model:model-value="parameter.bobot"
                        placeholder="0.000"
                        :min="0"
                        :max="1"
                        :minFractionDigits="3"
                        :maxFractionDigits="3"
                        class="w-full"
                    />
                    <small class="text-gray-500">Range: 0-1</small>
                </div>
                <div class="col-span-3">
                    <label class="block font-medium mb-2">Sub Faktor L2</label>
                    <InputNumber
                        v-model:model-value="parameter.subFaktorLevel2"
                        placeholder="0.000"
                        :min="0"
                        :max="1"
                        :minFractionDigits="3"
                        :maxFractionDigits="3"
                        class="w-full"
                    />
                    <small class="text-gray-500">Range: 0-1</small>
                </div>
                <div class="col-span-3">
                    <label class="block font-medium mb-2">Sub Faktor L1</label>
                    <InputNumber
                        v-model:model-value="parameter.subFaktorLevel1"
                        placeholder="0.000"
                        :min="0"
                        :max="1"
                        :minFractionDigits="3"
                        :maxFractionDigits="3"
                        class="w-full"
                    />
                    <small class="text-gray-500">Range: 0-1</small>
                </div>
                <div class="col-span-3">
                    <label class="block font-medium mb-2">PIC</label>
                    <Dropdown
                        v-model:model-value="parameter.pic"
                        :options="divisions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Pilih PIC"
                        class="w-full"
                    />
                    <small class="text-gray-500">Person In Charge</small>
                </div>
            </div>
            
            <!-- Fulfillment Description Row -->
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label class="block font-medium mb-2">Uraian Pemenuhan</label>
                    <Textarea
                        v-model:model-value="parameter.uraianPemenuhan"
                        rows="2"
                        autoResize
                        placeholder="Uraian pemenuhan kriteria"
                        class="w-full"
                    />
                </div>
            </div>
            
            <!-- Attachment Section -->
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <label class="block font-medium mb-2">
                        <i class="pi pi-paperclip mr-2"></i>
                        Attachment (Optional)
                    </label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <!-- File Upload -->
                        <FileUpload
                            mode="basic"
                            :multiple="true"
                            :accept="allowedFileTypes.join(',')"
                            :maxFileSize="maxFileSize"
                            @select="(event) => onFileSelect(event, parameter.id)"
                            chooseLabel="Pilih File"
                            class="mb-3"
                        />
                        
                        <!-- File List -->
                        <div v-if="selectedFiles[parameter.id] && selectedFiles[parameter.id].length > 0" class="space-y-2">
                            <div class="text-sm font-medium text-gray-700 mb-2">
                                File yang dipilih ({{ selectedFiles[parameter.id].length }}):
                            </div>
                            <div 
                                v-for="(file, index) in selectedFiles[parameter.id]" 
                                :key="index"
                                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                                <div class="flex items-center gap-3">
                                    <i :class="getFileIcon(file.name)" class="text-blue-600 text-lg"></i>
                                    <div>
                                        <div class="font-medium text-sm">{{ file.name }}</div>
                                        <div class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</div>
                                    </div>
                                </div>
                                <Button
                                    icon="pi pi-times"
                                    severity="danger"
                                    size="small"
                                    text
                                    @click="removeFile(parameter.id, index)"
                                    v-tooltip="'Hapus file'"
                                />
                            </div>
                        </div>
                        
                        <!-- Supported File Types Info -->
                        <div class="text-xs text-gray-500 mt-2">
                            <i class="pi pi-info-circle mr-1"></i>
                            Format yang didukung: {{ allowedFileTypes.join(', ').toUpperCase() }} 
                            (Maksimal {{ Math.round(maxFileSize / 1024 / 1024) }}MB per file)
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Children Parameters -->
        <div v-if="parameter.children && parameter.children.length > 0" class="mt-6 space-y-6">
            <div class="border-t pt-4">
                <div class="flex items-center gap-2 mb-4">
                    <i class="pi pi-sitemap text-gray-500"></i>
                    <span class="font-medium text-gray-700">Sub Parameter ({{ parameter.children.length }})</span>
                </div>
                
                <ParameterItem
                    v-for="child in parameter.children"
                    :key="child.id"
                    :parameter="child"
                    :level="level + 1"
                    :onAddSub="onAddSub"
                    :onAddSubSub="onAddSubSub"
                    :onAddSubSubSub="onAddSubSubSub"
                    :onRemove="onRemove"
                    :getLevelLabel="getLevelLabel"
                    :getLevelIcon="getLevelIcon"
                    :getLevelColor="getLevelColor"
                    :getPadding="getPadding"
                    :subFaktorOptions="subFaktorOptions"
                    :statusOptions="statusOptions"
                    :divisions="divisions"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber),
:deep(.p-inputtextarea) {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-inputnumber:focus),
:deep(.p-inputtextarea:focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
</style>
