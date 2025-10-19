<script setup>
import { useAuth } from '@/stores';
import { useToast } from 'primevue/usetoast';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuth();
const toast = useToast();
const router = useRouter();
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const emailError = ref('');
const passwordError = ref('');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = () => {
    let isValid = true;
    
    // Reset error messages
    emailError.value = '';
    passwordError.value = '';
    
    // Validate email
    if (!email.value || email.value.trim() === '') {
        emailError.value = 'Email tidak boleh kosong';
        isValid = false;
    } else if (email.value.includes(' ')) {
        emailError.value = 'Email tidak boleh mengandung spasi';
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        emailError.value = 'Format email tidak valid';
        isValid = false;
    }
    
    // Validate password
    if (!password.value || password.value.trim() === '') {
        passwordError.value = 'Password tidak boleh kosong';
        isValid = false;
    } else if (password.value.includes(' ')) {
        passwordError.value = 'Password tidak boleh mengandung spasi';
        isValid = false;
    }
    
    return isValid;
};

const onClickLogin = () => {
    // Validate form before proceeding
    if (!validateForm()) {
        return;
    }
    
    isLoading.value = true;
    authStore
        .login(email.value, password.value)
        .then((resp) => {
            if (resp.success) {
                window.location = '/';
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Kesalahan',
                    detail: resp.message,
                    life: 3000
                });
            }
            isLoading.value = false;
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: e.name,
                detail: e.message,
                life: 3000
            });
            isLoading.value = false;
        });
};

const onClickForgotPassword = () => {
    router.push('/auth/forgot-password');
};

const onClickSSOLogin = async () => {
    try {
        isLoading.value = true;
        
        // Call the OAuth sendUrl endpoint directly (without /api prefix)
        const response = await fetch('/oauth/sendUrl', {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            console.log('SSO Response Data:', data);
            
            if (data.url) {
                // Open Microsoft authorization URL in new browser window
                window.open(data.url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                
                // Show success message
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'SSO login telah dibuka di jendela baru. Silakan selesaikan login di jendela tersebut.',
                    life: 5000
                });
            } else {
                throw new Error('URL tidak ditemukan dalam response');
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error during SSO login:', error);
        
        let errorMessage = 'Gagal menginisiasi SSO login. Silakan coba lagi.';
        
        if (error.message.includes('login-failure')) {
            errorMessage = 'Login SSO gagal. Silakan periksa konfigurasi atau coba lagi.';
        } else if (error.message.includes('CORS')) {
            errorMessage = 'Terjadi masalah CORS. Silakan hubungi administrator.';
        } else if (error.message.includes('Network')) {
            errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        isLoading.value = false;
    }
};

// Handle OAuth success message from popup
const handleOAuthMessage = (event) => {
    if (event.data.type === 'OAUTH_SUCCESS') {
        
        // Store authentication data
        if (event.data.token) {
            authStore.setToken(event.data.token);
        }
        if (event.data.user) {
            authStore.setUser(event.data.user);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Login SSO berhasil!',
            life: 3000
        });
        
        // Wait a bit for state to update, then redirect
        setTimeout(() => {
            console.log('Attempting redirect to dashboard...');
            console.log('AuthStore isLoggedIn before redirect:', authStore.isLoggedIn);
            router.push('/dashboard').then(() => {
                console.log('Redirect successful');
            }).catch((error) => {
                console.error('Redirect failed:', error);
            });
        }, 100);
    }
};

onMounted(() => {
    window.addEventListener('message', handleOAuthMessage);
});

onUnmounted(() => {
    window.removeEventListener('message', handleOAuthMessage);
});
</script>

<template>
    <div class="bg-primary-50 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden w-full">
        <div class="flex flex-row justify-between w-full min-h-screen">
            <div class="flex flex-col items-center justify-center w-full md:w-[800px] min-h-screen bg-[#05a1b8cc]">
                <div class="w-[350px] bg-white py-10 px-8 rounded-xl border-2 border-slate-300">
                    <div class="mb-10 flex justify-center gap-4 items-center">
                        <img :src="'/demo/images/logo_plnepi.png'" alt="logo pln" width="200" />
                        <!--<span class="font-bold text-primary text-3xl">EPI</span>-->
                    </div>
                    <div>
                        <label for="email"
                            class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email" type="email" placeholder="Email" class="w-full"
                            :class="{ 'p-invalid': emailError }" v-model="email" />
                        <small v-if="emailError" class="text-red-500 block mb-4">{{ emailError }}</small>
                        <div v-else class="mb-4"></div>

                        <label for="password1"
                            class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true"
                            :class="{ 'p-invalid': passwordError }" class="w-full" fluid :feedback="false"></Password>
                        <small v-if="passwordError" class="text-red-500 block mb-4">{{ passwordError }}</small>
                        <div v-else class="mb-4"></div>
                        
                        <!-- Forgot Password Link -->
                        <div class="text-right mb-4">
                            <a href="#" @click.prevent="onClickForgotPassword" 
                               class="forgot-password-link">
                                Lupa Password?
                            </a>
                        </div>
                        
                        <!-- Sign In Button -->
                        <Button label="Sign In" class="w-full mb-6" type="button" @click="onClickLogin"
                            :loading="isLoading"></Button>
                        
                        <!-- Divider -->
                        <div class="relative mb-6">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-gray-300"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="divider-text">or sign in with</span>
                            </div>
                        </div>
                        
                        <!-- SSO Login Button -->
                        <Button 
                            label="SSO Login PLNEPI" 
                            class="w-full" 
                            type="button" 
                            @click="onClickSSOLogin"
                            severity="secondary"
                            outlined
                            :loading="isLoading"
                            :disabled="isLoading"
                        >
                            <template #icon v-if="!isLoading">
                                <svg class="microsoft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="9" height="9" fill="#F25022"/>
                                    <rect x="12" y="3" width="9" height="9" fill="#7FBA00"/>
                                    <rect x="3" y="12" width="9" height="9" fill="#00A4EF"/>
                                    <rect x="12" y="12" width="9" height="9" fill="#FFB900"/>
                                </svg>
                            </template>
                        </Button>
                    </div>
                </div>
            </div>
            <div class=" flex-col items-center justify-center w-full bg-cover bg-no-repeat bg-center bg-[url(https://cmsadmin.plnepi.co.id/storage/media/KOMISARIS-05.jpg)] hidden md:block">
                <div class="flex flex-col items-center justify-center w-full h-full">
                    <div class="font-bold text-white text-6xl w-full text-center bg-black/20 py-5">SynerGCG</div>
                </div>
            </div>
        </div>
    </div>
    <Toast  position="top-left" />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

/* SSO Button Styling */
:deep(.p-button-outlined) {
    border: 1px solid #d1d5db;
    background-color: white;
    color: #374151;
    transition: all 0.2s ease;
}

:deep(.p-button-outlined:hover) {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

/* Microsoft Icon Styling */
.microsoft-icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
}

/* Forgot Password Link Styling */
.forgot-password-link {
    color: #2563eb;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s ease;
}

.forgot-password-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
}

/* Divider Styling */
.divider-text {
    background-color: white;
    padding: 0 8px;
    color: #6b7280;
    font-size: 14px;
}
</style>
