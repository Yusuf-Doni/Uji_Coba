<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/stores';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuth();
const toast = useToast();
const isLoading = ref(true);
const error = ref(null);

const handleOAuthCallback = async () => {
    try {
        // Get the authorization code from URL parameters
        const code = route.query.code;
        const errorParam = route.query.error;
        const sessionState = route.query.session_state;
        
        console.log('OAuth Callback - Code:', code);
        console.log('OAuth Callback - Session State:', sessionState);
        console.log('OAuth Callback - Error:', errorParam);
        
        if (errorParam) {
            throw new Error(`OAuth error: ${errorParam}`);
        }
        
        if (!code) {
            throw new Error('Authorization code tidak ditemukan');
        }
        
        // OAuth Flow: 
        // 1. User clicks SSO -> /oauth/sendUrl (opens Microsoft login)
        // 2. Microsoft redirects to /oauth/callback?code=xxx (this component)
        // 3. Exchange code with /oauth/azureuri/{code}
        // 4. If success -> redirect to dashboard
        
        const endpoints = [
            `/oauth/azureuri/${code}` // Exchange authorization code for token
        ];
        
        let response = null;
        let parsedData = null;
        let lastError = null;
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                
                // Use GET for all OAuth endpoints
                const method = 'GET';
                
                const requestOptions = {
                    method: method,
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'omit' // Don't send cookies/credentials
                };
                
                // All requests are GET, no body needed
                
                response = await fetch(endpoint, requestOptions);
                
                
                if (response.ok) {
                    // Check if response is actually JSON
                    const responseText = await response.text();
                    
                    if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                        lastError = new Error(`Backend returned HTML page instead of JSON for ${endpoint}`);
                    } else if (!responseText || responseText.trim() === '') {
                        lastError = new Error(`Backend returned empty response for ${endpoint}`);
                    } else {
                        try {
                            // Try to parse JSON
                            parsedData = JSON.parse(responseText);
                            break;
                        } catch (jsonError) {
                            lastError = new Error(`Backend returned invalid JSON for ${endpoint}: ${jsonError.message}`);
                        }
                    }
                } else {
                    const errorText = await response.text();
                    lastError = new Error(`HTTP ${response.status}: ${errorText}`);
                }
            } catch (err) {
                lastError = err;
            }
        }
        
        if (!parsedData) {
            throw lastError || new Error('OAuth endpoint failed');
        }
        
        
        if (parsedData) {
            const data = parsedData;
            
            // Handle successful authentication
            if (data.success || data.token || data.user) {
                // Store authentication data if needed
                if (data.token) {
                    authStore.setToken(data.token);
                }
                if (data.user) {
                    authStore.setUser(data.user);
                }
                
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Login SSO berhasil. Anda dapat menutup tab ini.',
                    life: 5000
                });
                
                // Redirect to dashboard
                setTimeout(() => {
                    // Try to close the tab if it was opened by window.open
                    if (window.opener) {
                        // Prepare user data from OAuth response
                        const userData = {
                            email: data.email,
                            user_id: data.user_id,
                            namaRole: data.namaRole,
                            role_id: data.role_id,
                            role_type: data.role_type,
                            menus: data.menus,
                            name: data.name || data.email?.split('@')[0]
                        };
                        
                        
                        // Notify parent window that login was successful
                        window.opener.postMessage({ 
                            type: 'OAUTH_SUCCESS', 
                            token: data.token, 
                            user: userData 
                        }, '*');
                        window.close();
                    } else {
                        // If can't close, redirect to dashboard
                        router.push('/');
                    }
                }, 2000);
            } else {
                console.error('OAuth failed - Response data:', data);
                throw new Error(data.message || 'Login SSO gagal');
            }
        } else {
            const errorText = await response.text();
            console.error('OAuth HTTP Error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
    } catch (err) {
        console.error('OAuth callback error:', err);
        error.value = err.message;
        
        let errorMessage = 'Terjadi kesalahan saat login SSO';
        
        if (err.message.includes('401')) {
            errorMessage = 'Backend memerlukan konfigurasi OAuth yang benar. Silakan hubungi administrator.';
        } else if (err.message.includes('All OAuth endpoints failed')) {
            errorMessage = 'Semua endpoint OAuth gagal. Periksa konfigurasi backend.';
        } else if (err.message.includes('Full authentication is required')) {
            errorMessage = 'Endpoint OAuth memerlukan authentication. Periksa konfigurasi backend.';
        } else if (err.message.includes('Backend returned HTML page')) {
            errorMessage = 'Backend mengembalikan halaman HTML (login/error) bukan JSON. Periksa konfigurasi security backend.';
        } else if (err.message.includes('Backend returned empty response')) {
            errorMessage = 'Backend mengembalikan response kosong. Periksa konfigurasi backend.';
        } else if (err.message.includes('Backend returned invalid JSON')) {
            errorMessage = 'Backend mengembalikan JSON yang tidak valid. Periksa konfigurasi backend.';
        } else if (err.message.includes('Unexpected end of JSON input')) {
            errorMessage = 'Backend mengembalikan JSON yang tidak lengkap. Periksa konfigurasi backend.';
        } else {
            errorMessage = err.message || 'Terjadi kesalahan saat login SSO';
        }
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
        
        // Redirect back to login page after error
        setTimeout(() => {
            router.push('/auth/login');
        }, 3000);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    console.log('OAuth Callback - Mounted');
    handleOAuthCallback();
});
</script>

<template>
    <div class="bg-primary-50 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden w-full">
        <div class="flex flex-col items-center justify-center w-full min-h-screen">
            <div class="w-[400px] bg-white py-10 px-8 rounded-xl border-2 border-slate-300 text-center">
                <div class="mb-6 flex justify-center">
                    <img :src="'/demo/images/logo_plnepi.png'" alt="logo pln" width="200" />
                </div>
                
                <!-- Loading State -->
                <div v-if="isLoading" class="space-y-4">
                    <div class="flex justify-center">
                        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
                    </div>
                    <h2 class="text-xl font-semibold text-gray-800">Memproses Login SSO...</h2>
                    <p class="text-gray-600">Mohon tunggu sebentar</p>
                </div>
                
                <!-- Error State -->
                <div v-else-if="error" class="space-y-4">
                    <div class="flex justify-center">
                        <i class="pi pi-times-circle text-4xl text-red-600"></i>
                    </div>
                    <h2 class="text-xl font-semibold text-red-800">Login SSO Gagal</h2>
                    <p class="text-gray-600">{{ error }}</p>
                    <p class="text-sm text-gray-500">Anda akan diarahkan kembali ke halaman login...</p>
                </div>
                
                <!-- Success State -->
                <div v-else class="space-y-4">
                    <div class="flex justify-center">
                        <i class="pi pi-check-circle text-4xl text-green-600"></i>
                    </div>
                    <h2 class="text-xl font-semibold text-green-800">Login SSO Berhasil</h2>
                    <p class="text-gray-600">Anda dapat menutup tab ini dan kembali ke aplikasi utama.</p>
                    <p class="text-sm text-gray-500">Tab ini akan tertutup otomatis dalam beberapa detik...</p>
                </div>
            </div>
        </div>
    </div>
    
    <Toast position="top-center" />
</template>

<style scoped>
/* Custom styles for OAuth callback page */
.space-y-4 > * + * {
    margin-top: 1rem;
}
</style>
