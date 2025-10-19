<script setup>
import axios from 'axios';
import { onMounted, onUpdated, ref } from 'vue';
import { useAuth } from '@/stores';
import VuePdfEmbed from 'vue-pdf-embed';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    url: {
        type: String,
        default: null
    },
    fileName: {
        type: String,
        default: null
    },
    isShowLabel: {
        type: Boolean,
        default: true
    },
    isNeedToken: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: 'Preview'
    },
    isPopUp: {
        type: Boolean,
        default: true
    },
    // isShow: {
    //     type: Boolean,
    //     default: false
    // },
    // isLoading: {
    //     type: Boolean,
    //     default: false
    // },
    width: {
        type: Number,
        default: 800
    },
    height: {
        type: Number,
        default: 400
    },
    preview: {
        type: Boolean,
        default: false
    },
    info: {
        type: String
    },
    onClose: {
        type: Function,
        default: () => {}
    }
});
const isShow = defineModel('isShow');
const emit = defineEmits(['onclose']);

const toast = useToast();
const urls = ref(null);
const dataType = ref('');
const isPopupInternal = ref(false);
const isLoading = ref(false);

const previewImage = async (url) => {
    isLoading.value = true;
    const authStore = useAuth();

    if (url) {
        axios({
            url: url, // File URL Goes Here
            method: 'GET',
            responseType: 'blob',
            headers: {
                Authorization: props.isNeedToken ? `Bearer ${authStore?.token}` : ''
            }
        }).then((res) => {
            // Handle MIME type detection with fallback
            let detectedType = res.data.type;
            
            // If no MIME type or generic type, try to determine from URL or filename
            if (!detectedType || detectedType === 'application/octet-stream') {
                // Check if it's a document type based on filename or URL
                const urlLower = url.toLowerCase();
                const fileNameLower = props.fileName ? props.fileName.toLowerCase() : '';
                
                if (urlLower.includes('materi_rapat') || fileNameLower.includes('materi_rapat') ||
                    urlLower.includes('kko') || fileNameLower.includes('kko') ||
                    urlLower.includes('kkf') || fileNameLower.includes('kkf') ||
                    urlLower.includes('kr') || fileNameLower.includes('kr') ||
                    urlLower.includes('fra') || fileNameLower.includes('fra') ||
                    urlLower.includes('ctr') || fileNameLower.includes('ctr') ||
                    urlLower.includes('pakta') || fileNameLower.includes('pakta') ||
                    urlLower.includes('form_review') || fileNameLower.includes('form_review')) {
                    detectedType = 'application/pdf';
                } else if (fileNameLower.endsWith('.pdf')) {
                    detectedType = 'application/pdf';
                } else if (fileNameLower.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
                    detectedType = 'image';
                }
            }
            
            console.log('Detected MIME type:', detectedType, 'for URL:', url);
            dataType.value = detectedType;
            urls.value = URL.createObjectURL(res.data); 
            isLoading.value = false;
        }).catch((err) => {
            console.error(err);
            toast.add({
                    severity: 'error',
                    summary: 'Kesalahan',
                    detail: 'URL file tidak valid',
                    life: 3000
                });
        });
    }
};

onMounted(() => {
    previewImage(props.url);
});

onUpdated(() => {
    // text content should be the same as current `count.value`
    if (props.isPopUp) {
        previewImage(props.url);
    }
});

const downloadFile = () => {
    const authStore = useAuth();

    fetch(props.url, {
        headers: {
            Authorization: props.isNeedToken ? `Bearer ${authStore?.token}` : ''
        }
    })
        .then((response) => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error('File download failed');
            }
        })
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = props.fileName || 'download'; // fallback filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up
        })
        .catch((error) => {
            toast.add({
                severity: 'error',
                summary: 'Kesalahan',
                detail: 'Tidak dapat mengunduh file',
                life: 3000
            });
        });
};

const showDialog = () => {
    isShow.value = !isShow.value;
    isPopupInternal.value = true;
};

const closeCallback = () => {
    emit('onclose');
};
</script>
<template>
    <div
        v-if="!isPopUp && dataType !== 'text/html' && dataType !== ''"
        :class="`flex flex-col mb-0 p-6`"
    >
        <div
            v-if="isShowLabel"
            class="block font-bold mb-3 text-xl align-middle self-center"
        >
            <label>
                {{ label }}
            </label>
        </div>
        <div
            :class="`flex flex-row border border-collapse border-gray-400`"
            :style="`width: ${width + 2}px; min-height: 30px`"
        >
            <Skeleton
                class="mb-2 h-full"
                v-show="isLoading"
            ></Skeleton>
            <div
                v-show="!isLoading"
                style="position: relative; display: inline-flex"
            >
                <Image
                    v-show="!isLoading && dataType.includes('image')"
                    :src="urls"
                    alt="Image"
                    :width="width"
                    :height="height"
                />
                <VuePdfEmbed
                    v-show="!isLoading && (dataType == 'application/pdf' || dataType.includes('MATERI_RAPAT') || dataType.includes('KKO') || dataType.includes('KKF') || dataType.includes('KR') || dataType.includes('FRA') || dataType.includes('CTR') || dataType.includes('PAKTA_INTEGRITAS') || dataType.includes('FORM_REVIEW'))"
                    :source="urls"
                    :width="width"
                    :height="height"
                    :page="1"
                />
                <Button
                    v-if="preview"
                    icon="pi pi-eye"
                    rounded
                    outlined
                    aria-label="Filter"
                    severity="secondary"
                    style="
                        color: gray;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        z-index: 1;
                        width: 30px !important;
                        height: 30px !important;
                        transform: translate(-50%, -50%);
                    "
                    @click="showDialog()"
                />
            </div>
        </div>
    </div>

    <div
        v-else-if="!isPopUp && dataType === 'text/html'"
        :class="`flex flex-col mb-0`"
    >
        <!-- <Button icon="pi pi-file" text aria-label="Filter" severity="danger" size="large" label="File Not Found" /> -->
        <label class="text-red-500">File Not Found</label>
    </div>
    <div
        v-else-if="!isPopUp"
        :class="`flex flex-col mb-0`"
    >
        <Button
            icon="pi pi-download"
            text
            aria-label="Filter"
            severity="danger"
            size="medium"
            label="Download"
            @click="downloadFile()"
        />
    </div>
    <Dialog
        v-if="isPopUp || isPopupInternal"
        v-model:visible="isShow"
        modal
        :header="label"
        :class="`w-full h-fit m-10`"
        @after-hide="closeCallback()"
    >
        <template #header>
            <div
                class="w-full inline-flex align-items-center justify-content-center gap-2 mr-5"
            >
                <span class="w-full font-bold white-space-nowrap">{{
                    label
                }}</span>
                <Button
                    class="w-40"
                    icon="pi pi-download"
                    label="Download"
                    severity="secondary"
                    outlined
                    @click="downloadFile()"
                />
            </div>
        </template>
        <div class="flex flex-col justify-center content-center items-center">
            <label
                v-show="info"
                class="w-full font-normal text-wrap"
                >{{ info }}</label
            >
            <Divider />
            <Skeleton
                class="mb-2 h-full"
                v-show="isLoading"
            ></Skeleton>
            <div
                class="w-full flex flex-col justify-center content-center items-center bg-gray-300 py-5"
            >
                <Image
                    v-show="!isLoading && dataType.includes('image')"
                    :src="urls"
                    alt="Image"
                />
                <VuePdfEmbed
                    v-show="!isLoading && (dataType == 'application/pdf' || dataType.includes('MATERI_RAPAT') || dataType.includes('KKO') || dataType.includes('KKF') || dataType.includes('KR') || dataType.includes('FRA') || dataType.includes('CTR') || dataType.includes('PAKTA_INTEGRITAS') || dataType.includes('FORM_REVIEW'))"
                    :source="urls"
                    :page="1"
                    width="850"
                />
            </div>
        </div>
    </Dialog>
</template>
