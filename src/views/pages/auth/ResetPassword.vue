<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Toast from 'primevue/toast';
import Message from 'primevue/message';
import { useAuth } from '@/stores';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuth();

// Form state
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const newPasswordError = ref('');
const confirmPasswordError = ref('');
const isPasswordReset = ref(false);
const isTokenValid = ref(true);

// Get token from URL
const resetToken = ref('');

const validateForm = () => {
    let isValid = true;
    
    // Reset error messages
    newPasswordError.value = '';
    confirmPasswordError.value = '';
    
    // Validate new password
    if (!newPassword.value || newPassword.value.trim() === '') {
        newPasswordError.value = 'Password baru tidak boleh kosong';
        isValid = false;
    } else if (newPassword.value.length < 8) {
        newPasswordError.value = 'Password minimal 8 karakter';
        isValid = false;
    } else if (newPassword.value.includes(' ')) {
        newPasswordError.value = 'Password tidak boleh mengandung spasi';
        isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword.value)) {
        newPasswordError.value = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword.value || confirmPassword.value.trim() === '') {
        confirmPasswordError.value = 'Konfirmasi password tidak boleh kosong';
        isValid = false;
    } else if (confirmPassword.value !== newPassword.value) {
        confirmPasswordError.value = 'Password tidak cocok';
        isValid = false;
    }
    
    return isValid;
};

const onSubmit = async () => {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    try {
        isLoading.value = true;
        
        // Call actual API endpoint
        const response = await authStore.resetPassword({
            token: resetToken.value,
            newPassword: newPassword.value,
            confirmPassword: confirmPassword.value
        });
        
        // Check if response is successful
        if (response.status === 200 || response.status === 201) {
            // Show success state
            isPasswordReset.value = true;
            
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Password Anda berhasil direset. Silakan login dengan password baru.',
                life: 5000
            });
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } else {
            throw new Error('Gagal mereset password');
        }
        
    } catch (error) {
        console.error('Error resetting password:', error);
        
        // Handle different types of errors
        let errorMessage = 'Terjadi kesalahan saat mereset password';
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.response?.status === 400) {
            errorMessage = 'Token tidak valid atau sudah kadaluarsa';
        } else if (error.response?.status === 404) {
            errorMessage = 'Token reset password tidak ditemukan';
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

// Validate reset token on mount
onMounted(() => {
    resetToken.value = route.query.token || '';
    
    if (!resetToken.value) {
        isTokenValid.value = false;
        toast.add({
            severity: 'error',
            summary: 'Token Tidak Valid',
            detail: 'Link reset password tidak valid atau sudah kadaluarsa',
            life: 5000
        });
    }
    
    // Optional: Validate token with backend
    // validateResetToken(resetToken.value);
});

// Optional function to validate token with backend
const validateResetToken = async (token) => {
    try {
        // If you have a token validation endpoint, uncomment and implement:
        // const response = await authService.validateResetToken(token);
        // if (response.status === 200) {
        //     isTokenValid.value = true;
        // } else {
        //     isTokenValid.value = false;
        // }
        
        // For now, just check if token exists
        isTokenValid.value = !!token;
    } catch (error) {
        console.error('Error validating reset token:', error);
        isTokenValid.value = false;
        toast.add({
            severity: 'error',
            summary: 'Token Tidak Valid',
            detail: 'Link reset password tidak valid atau sudah kadaluarsa',
            life: 5000
        });
    }
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
                    
                    <!-- Invalid Token State -->
                    <div v-if="!isTokenValid">
                        <div class="text-center mb-6">
                            <div class="mb-4">
                                <i class="pi pi-times-circle text-6xl text-red-500"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                Link Tidak Valid
                            </h2>
                            <p class="text-gray-600 text-sm">
                                Link reset password tidak valid atau sudah kadaluarsa
                            </p>
                        </div>
                        
                        <Message severity="error" :closable="false" class="mb-4">
                            <div class="text-sm">
                                Silakan request link reset password baru dari halaman lupa password
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
                                label="Lupa Password" 
                                class="w-full"
                                severity="secondary"
                                outlined
                                @click="() => router.push('/auth/forgot-password')"
                            />
                        </div>
                    </div>
                    
                    <!-- Success State -->
                    <div v-else-if="isPasswordReset">
                        <div class="text-center mb-6">
                            <div class="mb-4">
                                <i class="pi pi-check-circle text-6xl text-green-500"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                Password Berhasil Direset!
                            </h2>
                            <p class="text-gray-600 text-sm">
                                Password Anda telah berhasil diubah
                            </p>
                        </div>
                        
                        <Message severity="success" :closable="false" class="mb-4">
                            <div class="text-sm">
                                Anda akan diarahkan ke halaman login dalam beberapa detik...
                            </div>
                        </Message>
                        
                        <Button 
                            label="Login Sekarang" 
                            class="w-full"
                            severity="primary"
                            @click="onBackToLogin"
                        />
                    </div>
                    
                    <!-- Form State -->
                    <div v-else>
                        <div class="text-center mb-6">
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">
                                Reset Password
                            </h2>
                            <p class="text-gray-600 text-sm">
                                Masukkan password baru Anda
                            </p>
                        </div>
                        
                        <form @submit.prevent="onSubmit">
                            <div class="mb-4">
                                <label for="newPassword" class="block text-gray-700 font-medium text-base mb-2">
                                    Password Baru <span class="text-red-500">*</span>
                                </label>
                                <Password 
                                    id="newPassword" 
                                    v-model="newPassword"
                                    placeholder="Masukkan password baru"
                                    :toggleMask="true"
                                    :class="{ 'p-invalid': newPasswordError }"
                                    class="w-full"
                                    fluid
                                    @input="newPasswordError = ''"
                                >
                                    <template #header>
                                        <h6 class="font-semibold">Ketentuan Password:</h6>
                                    </template>
                                    <template #footer>
                                        <ul class="pl-2 ml-2 mt-0 line-height-3 text-sm">
                                            <li>Minimal 8 karakter</li>
                                            <li>Minimal 1 huruf kecil</li>
                                            <li>Minimal 1 huruf besar</li>
                                            <li>Minimal 1 angka</li>
                                            <li>Tidak mengandung spasi</li>
                                        </ul>
                                    </template>
                                </Password>
                                <small v-if="newPasswordError" class="text-red-500 block mt-1">
                                    {{ newPasswordError }}
                                </small>
                            </div>
                            
                            <div class="mb-6">
                                <label for="confirmPassword" class="block text-gray-700 font-medium text-base mb-2">
                                    Konfirmasi Password <span class="text-red-500">*</span>
                                </label>
                                <Password 
                                    id="confirmPassword" 
                                    v-model="confirmPassword"
                                    placeholder="Masukkan ulang password baru"
                                    :toggleMask="true"
                                    :class="{ 'p-invalid': confirmPasswordError }"
                                    class="w-full"
                                    fluid
                                    :feedback="false"
                                    @input="confirmPasswordError = ''"
                                />
                                <small v-if="confirmPasswordError" class="text-red-500 block mt-1">
                                    {{ confirmPasswordError }}
                                </small>
                            </div>
                            
                            <div class="space-y-3">
                                <Button 
                                    type="submit"
                                    label="Reset Password" 
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

/* Password input styling */
.pi-eye,
.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

/* Button hover effects */
:deep(.p-button) {
    transition: all 0.2s ease;
}

:deep(.p-button:hover:not(:disabled)) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Success/Error icon animation */
@keyframes iconPulse {
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

.pi-check-circle,
.pi-times-circle {
    animation: iconPulse 0.5s ease-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .w-\[400px\] {
        width: 90%;
        max-width: 400px;
    }
}
</style>

