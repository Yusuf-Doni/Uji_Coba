<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import Card from 'primevue/card';
import Message from 'primevue/message';
import { useAuth } from '@/stores';

const router = useRouter();
const toast = useToast();
const authStore = useAuth();

// Form state
const email = ref('');
const isLoading = ref(false);
const emailError = ref('');
const isEmailSent = ref(false);

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = () => {
    emailError.value = '';
    
    if (!email.value || email.value.trim() === '') {
        emailError.value = 'Email tidak boleh kosong';
        return false;
    }
    
    if (email.value.includes(' ')) {
        emailError.value = 'Email tidak boleh mengandung spasi';
        return false;
    }
    
    if (!emailRegex.test(email.value)) {
        emailError.value = 'Format email tidak valid';
        return false;
    }
    
    return true;
};

const onSubmit = async () => {
    // Validate email
    if (!validateEmail()) {
        return;
    }
    
    try {
        isLoading.value = true;
        
        // Call actual API endpoint
        const response = await authStore.forgotPassword(email.value);
        
        // Check if response is successful
        if (response.status === 200 || response.status === 201) {
            // Show success state
            isEmailSent.value = true;
            
            toast.add({
                severity: 'success',
                summary: 'Email Terkirim',
                detail: 'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.',
                life: 5000
            });
        } else {
            throw new Error('Gagal mengirim email reset password');
        }
        
    } catch (error) {
        console.error('Error sending reset email:', error);
        
        // Handle different types of errors
        let errorMessage = 'Terjadi kesalahan saat mengirim email reset password';
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: errorMessage,
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const onBackToLogin = () => {
    router.push('/auth/login');
};

const onResendEmail = () => {
    isEmailSent.value = false;
    email.value = '';
    emailError.value = '';
};
</script>

<template>
    <div class="bg-primary-50 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-row justify-between w-full min-h-screen">
            <!-- Left Side - Form -->
            <div class="flex flex-col items-center justify-center w-full md:w-[800px] min-h-screen bg-[#05a1b8cc]">
                <div class="w-[400px] bg-white py-10 px-8 rounded-xl border-2 border-slate-300">
                    <!-- Logo -->
                    <div class="mb-6 flex justify-center">
                        <img :src="'/demo/images/logo_plnepi.png'" alt="logo pln" width="200" />
                    </div>
                    
                    <!-- Success State -->
                    <div v-if="isEmailSent">
                        <div class="text-center mb-6">
                            <div class="mb-4">
                                <i class="pi pi-check-circle text-6xl text-green-500"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                Email Terkirim!
                            </h2>
                            <p class="text-gray-600 text-sm">
                                Kami telah mengirim link reset password ke email:
                            </p>
                            <p class="font-semibold text-gray-800 mt-2">
                                {{ email }}
                            </p>
                        </div>
                        
                        <Message severity="info" :closable="false" class="mb-4">
                            <div class="text-sm">
                                Silakan cek inbox atau folder spam Anda. Link akan kadaluarsa dalam 24 jam.
                            </div>
                        </Message>
                        
                        <div class="space-y-3">
                            <Button 
                                label="Kembali ke Login" 
                                class="w-full"
                                severity="primary"
                                @click="onBackToLogin"
                            />
                            
                            <Button 
                                label="Kirim Ulang Email" 
                                class="w-full"
                                severity="secondary"
                                outlined
                                @click="onResendEmail"
                            />
                        </div>
                    </div>
                    
                    <!-- Form State -->
                    <div v-else>
                        <div class="text-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                Lupa Password?
                            </h2>
                            <p class="text-gray-600 text-sm">
                                Masukkan email Anda dan kami akan mengirimkan link untuk reset password
                            </p>
                        </div>
                        
                        <form @submit.prevent="onSubmit">
                            <div class="mb-6">
                                <label for="email" class="block text-gray-700 font-medium text-base mb-2">
                                    Email <span class="text-red-500">*</span>
                                </label>
                                <InputText 
                                    id="email" 
                                    v-model="email"
                                    type="email" 
                                    placeholder="Masukkan email Anda"
                                    class="w-full"
                                    :class="{ 'p-invalid': emailError }"
                                    @input="emailError = ''"
                                />
                                <small v-if="emailError" class="text-red-500 block mt-1">
                                    {{ emailError }}
                                </small>
                            </div>
                            
                            <div class="space-y-3">
                                <Button 
                                    type="submit"
                                    label="Kirim Link Reset Password" 
                                    class="w-full"
                                    severity="primary"
                                    :loading="isLoading"
                                    :disabled="isLoading"
                                />
                                
                                <Button 
                                    type="button"
                                    label="Kembali ke Login" 
                                    class="w-full"
                                    severity="secondary"
                                    outlined
                                    @click="onBackToLogin"
                                    :disabled="isLoading"
                                />
                            </div>
                        </form>
                        
                        <!-- Help Text -->
                        <div class="mt-6 text-center">
                            <p class="text-xs text-gray-500">
                                Tidak menerima email? Cek folder spam atau hubungi administrator
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Side - Background Image -->
            <div class="flex-col items-center justify-center w-full bg-cover bg-no-repeat bg-center bg-[url(https://cmsadmin.plnepi.co.id/storage/media/KOMISARIS-05.jpg)] hidden md:block">
                <div class="flex flex-col items-center justify-center w-full h-full">
                    <div class="font-bold text-white text-6xl w-full text-center bg-black/20 py-5">
                        SynerGCG
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <Toast position="top-center" />
</template>

<style scoped>
/* Form validation styling */
:deep(.p-invalid) {
    border-color: #ef4444 !important;
}

/* Button hover effects */
:deep(.p-button) {
    transition: all 0.2s ease;
}

:deep(.p-button:hover:not(:disabled)) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Success icon animation */
@keyframes checkmark {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.pi-check-circle {
    animation: checkmark 0.5s ease-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .w-\[400px\] {
        width: 90%;
        max-width: 400px;
    }
}
</style>

