import AuthService from '@/service/Auth';
import { defineStore } from 'pinia';

const resp = {
    data: {
        success: true,
        data: {
            userId: 123,
            email: 'user1@example.com',
            role: ['unit'],
            // role: '',
            permissions: null,
            token: 'ecde3fa12164400c911971bbba4a3d48', // Mock token for development - UPDATE THIS WITH VALID TOKEN
            expiresAt: null,
            vendorIds: [],
            menus: [
                
                
                {
                    id: 111,
                    label: 'User Management',
                    icon: 'pi pi-fw pi-user',
                    to: null,
                    sequence: 11,
                    items: [
                        // {
                        //     id: 1111,
                        //     label: 'User',
                        //     icon: null,
                        //     to: '/user-management/user',
                        //     sequence: 1,
                        //     items: null,
                        //     parentId: 111
                        // }



                        {
                            id: 1117,
                            label: 'User Administrator',
                            icon: null,
                            to: '/user-administration/user',
                            sequence: 2,
                            items: null,
                            parentId: 111
                        }
                        // {
                        //     id: 1118,
                        //     label: 'User Roles & Permissions',
                        //     icon: null,
                        //     to: '/user-roles-permissions/role',
                        //     sequence: 3,
                        //     items: null,
                        //     parentId: 111
                        // },

                    ],
                    parentId: null
                },
                {
                    id: 112,
                    label: 'Master',
                    icon: 'pi pi-fw pi-user',
                    to: null,
                    sequence: 12,
                    items: [
                        {
                            "id": 1021,
                            "label": "Jenis Rapat Korporat",
                            "icon": null,
                            "to": '/jenis-rapat/rapat',
                            "sequence": 1,
                            "items": null,
                            "parentId": 102
                        },
                        {
                            "id": 1022,
                            "label": "Parameter",
                            "icon": null,
                            "to": '/parameter',
                            "sequence": 2,
                            "items": null,
                            "parentId": 102
                        },
                        {
                            "id": 1023,
                            "label": "Aspek",
                            "icon": null,
                            "to": '/aspek',
                            "sequence": 3,
                            "items": null,
                            "parentId": 102
                        },
                        {
                            "id": 1024,
                            "label": "Jenis File",
                            "icon": null,
                            "to": '/jenisFile/file',
                            "sequence": 4,
                            "items": null,
                            "parentId": 102
                        },
                        {
                            "id": 1025,
                            "label": "Direktorat",
                            "icon": null,
                            "to": '/direktorat',
                            "sequence": 5,
                            "items": null,
                            "parentId": 102
                        },
                        {
                            "id": 1026,
                            "label": "Divisi",
                            "icon": null,
                            "to": '/divisi',
                            "sequence": 6,
                            "items": null,
                            "parentId": 102
                        },
                        {
                            "id": 1027,
                            "label": "Jabatan",
                            "icon": null,
                            "to": '/jabatan',
                            "sequence": 7,
                            "items": null,
                            "parentId": 102
                        },
                    ],
                    "parentId": null
                },
                {
                    "id": 121,
                    "label": "Rapat Korporat",
                    "icon": "pi pi-fw pi-user",
                    "to": null,
                    "sequence": 11,
                    "items": [
                        {
                            "id": 1211,
                            "label": "Jadwal Rapat Korporat",
                            "icon": null,
                            "to": "/transaction/jadwal-rapat-korporat",
                            "sequence": 1,
                            "items": null,
                            "parentId": 121
                        },
                        // {
                        //     "id": 1212,
                        //     "label": "Kepdir Sirkuler",
                        //     "icon": null,
                        //     "to": "/kepdir-sirkuler",
                        //     "sequence": 2,
                        //     "items": null,
                        //     "parentId": 121
                        // },
                        {
                            "id": 1212,
                            "label": "Tindak Lanjut Rapat",
                            "icon": null,
                            "to": "/transaction/tindak-lanjut/tindak-lanjut-rapat",
                            "sequence": 2,
                            "items": null,
                            "parentId": 121
                        }
                    ],
                    parentId: null
                }
            ],
            permittedAction: [],
            name: 'Admin Satu'
        }
    }
};

export const useAuth = defineStore('auth', {
    state: () => ({
        id: localStorage.getItem('userId') ?? localStorage.getItem('id') ?? '',
        email: localStorage.getItem('email') ?? '',
        role: localStorage.getItem('role') ?? '',
        token: localStorage.getItem('token') ?? '',
        expiresAt: localStorage.getItem('expiresAt') ?? '',
        menus: localStorage.getItem('menus') 
            ? JSON.parse(localStorage.getItem('menus'))
            : [],
        permissions: localStorage.getItem('permissions')
            ? JSON.parse(localStorage.getItem('permissions'))
            : null,
        permittedAction: localStorage.getItem('permittedAction')
            ? JSON.parse(localStorage.getItem('permittedAction'))
            : [],
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        name: localStorage.getItem('name') ?? '',
        userId: localStorage.getItem('userId') ?? '',
        unitKerja: localStorage.getItem('unitKerja')
            ? JSON.parse(localStorage.getItem('unitKerja'))
            : null,
        vendor: localStorage.getItem('vendor')
            ? JSON.parse(localStorage.getItem('vendor'))
            : null
    }),
    getters: {
        // Getter untuk id yang mengambil dari userId
        getId: (state) => state.userId || state.id
    },
    actions: {
        async login(email, password) {
            // console.log('Attempting login for:', email);

            try {
                // Gunakan AuthService yang sudah ada
                const authService = new AuthService('auth/login');
                const response = await authService.post({ email, password });
                
                // console.log('Login response:', response);
                
                // Handle the actual response structure from your backend
                if (response.data && response.data.token) {
                    const token = response.data.token;
                    
                    // Extract user data from response if available
                    const userData = response.data || {};
                    const menus = userData.menus.menus || resp.data.data.menus || [];
                    const userId = userData.user_id || userData.userId || userData.id || '';
                    const userName = userData.name || userData.fullName || email.split('@')[0];
                    const userRole = response.data.namaRole || '';
                    const roleType = response.data.role_type || userData.role_type || '';
                    const permissions = userData.permissions || null;
                    const permittedAction = userData.permittedAction || [];
                    localStorage.setItem('role', roleType);
                    // Simpan data dari response API
                    localStorage.setItem('email', response.data.email || email);
                    // localStorage.setItem('role', JSON.stringify(userRole));
                    localStorage.setItem('token', token);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('id', userId); // Also save as 'id' for consistency
                    localStorage.setItem('userRole', userRole);
                    localStorage.setItem('expiresAt', userData.expiresAt || '');
                    localStorage.setItem('menus', JSON.stringify(menus));
                    localStorage.setItem('permissions', JSON.stringify(permissions));
                    localStorage.setItem('permittedAction', JSON.stringify(permittedAction));
                    localStorage.setItem('name', userName);

                    // Update state dengan data dari API
                    this.email = response.data.email || email;
                    this.id = userId;
                    this.userId = userId;
                    this.role = roleType;
                    this.token = token;
                    this.expiresAt = userData.expiresAt || '';
                    this.isLoggedIn = true;
                    this.menus = menus;
                    this.permissions = permissions;
                    this.permittedAction = permittedAction;
                    this.name = userName;
                    this.unitKerja = userData.unitKerja || null;
                    this.vendor = userData.vendor || null;
                    return Promise.resolve({ success: true, data: { token } });
                } else {
                    const errorMessage = response.data?.message || 'Authentication failed - no token received';
                    return Promise.reject(new Error(errorMessage));
                }
            } catch (error) {
                // Handle specific HTTP status codes
                if (error.response) {
                    const status = error.response.status;
                    const message = error.response.data?.message || error.response.data?.error || 'Authentication failed';
                    
                    if (status === 401) {
                        return Promise.reject(new Error('Invalid email or password. Please check your credentials.'));
                    } else if (status === 500) {
                        return Promise.reject(new Error('Server error. Please try again later.'));
                    } else if (status === 404) {
                        return Promise.reject(new Error('Authentication service not found. Please contact administrator.'));
                    } else {
                        return Promise.reject(new Error(`Authentication failed: ${message}`));
                    }
                } else if (error.request) {
                    return Promise.reject(new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.'));
                } else {
                    return Promise.reject(new Error('An unexpected error occurred during login.'));
                }
            }
        },

        async validateToken() {
            try {
                // Check if token exists
                if (!this.token) {
                    this.removeCredentials();
                    return Promise.reject(new Error('No token found'));
                }

                // Check if token has expired (if expiresAt is available)
                if (this.expiresAt) {
                    const now = new Date();
                    const expiryDate = new Date(this.expiresAt);
                    if (now > expiryDate) {
                        this.removeCredentials();
                        return Promise.reject(new Error('Token has expired'));
                    }
                }

                // For now, we'll just validate that the token exists in localStorage
                // In a real application, you might want to make an API call to validate the token
                const storedToken = localStorage.getItem('token');
                if (storedToken === this.token) {
                    return Promise.resolve({ success: true, message: 'Token is valid' });
                } else {
                    this.removeCredentials();
                    return Promise.reject(new Error('Token validation failed'));
                }
            } catch (error) {
                console.error('Token validation error:', error);
                this.removeCredentials();
                return Promise.reject(error);
            }
        },
        removeCredentials() {
            localStorage.removeItem('email');
            localStorage.removeItem('userId');
            localStorage.removeItem('id');
            localStorage.removeItem('role');
            localStorage.removeItem('token');
            localStorage.removeItem('expiresAt');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('menus');
            localStorage.removeItem('permissions');
            localStorage.removeItem('permittedAction');
            localStorage.removeItem('name');
            localStorage.removeItem('unitKerja');
            localStorage.removeItem('vendor');
            
            this.email = '';
            this.id = '';
            this.userId = '';
            this.role = '';
            this.token = '';
            this.expiresAt = '';
            this.isLoggedIn = false;
            this.menus = [];
            this.permissions = null;
            this.permittedAction = [];
            this.name = '';
            this.unitKerja = null;
            this.vendor = null;
        },
        
        // Method untuk refresh menu data dari API
        async refreshMenuData() {
            try {
                // Jika ada endpoint untuk mengambil menu berdasarkan user yang login
                // const authService = new AuthService('auth/menu');
                // const response = await authService.get();
                // 
                // if (response.data && response.data.menus) {
                //     this.menus = response.data.menus;
                //     localStorage.setItem('menus', JSON.stringify(response.data.menus));
                // }
                
                // Untuk sementara, gunakan data dari localStorage yang sudah ada
                const storedMenus = localStorage.getItem('menus');
                if (storedMenus) {
                    this.menus = JSON.parse(storedMenus);
                }
                
            } catch (error) {
                console.error('Error refreshing menu data:', error);
            }
        },
        
        // Method untuk update menu secara manual
        updateMenus(newMenus) {
            this.menus = newMenus;
            localStorage.setItem('menus', JSON.stringify(newMenus));
        },
        
        // Method untuk testing - update menu dengan data baru
        testUpdateMenu() {
            const newMenus = [
                {
                    id: 111,
                    label: 'User Management (Updated)',
                    icon: 'pi pi-fw pi-user',
                    to: null,
                    sequence: 11,
                    items: [
                        {
                            id: 1117,
                            label: 'User Administrator (Updated)',
                            icon: null,
                            to: '/user-administration/user',
                            sequence: 2,
                            items: null,
                            parentId: 111
                        }
                    ],
                    parentId: null
                },
                {
                    id: 112,
                    label: 'Master (Updated)',
                    icon: 'pi pi-fw pi-cog',
                    to: null,
                    sequence: 12,
                    items: [
                        {
                            id: 1021,
                            label: "Jenis Rapat Korporat (Updated)",
                            icon: null,
                            to: '/jenis-rapat/rapat',
                            sequence: 1,
                            items: null,
                            parentId: 102
                        }
                    ],
                    parentId: null
                }
            ];
            
            this.updateMenus(newMenus);
        },
        
        async logout() {
            try {
                // const response = await fetch('/api/auth/logout', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'Accept': 'application/json',
                //         'Authorization': `Bearer ${this.token}`
                //     }
                // });

                // if (!response.ok) {
                //     throw new Error(`HTTP error! status: ${response.status}`);
                // }

                // const data = await response.json();
                this.removeCredentials();
                // return Promise.resolve(data);
            } catch (error) {
                console.error('Logout error:', error);
                this.removeCredentials();
                return Promise.reject(error);
            }
        },

        // Method untuk OAuth SSO login
        setToken(token) {
            this.token = token;
            this.isLoggedIn = true; // Update state
            localStorage.setItem('token', token);
            localStorage.setItem('isLoggedIn', 'true');
        },

        setUser(userData) {
            if (userData.email) {
                this.email = userData.email;
                localStorage.setItem('email', userData.email);
            }
            // Handle both id and user_id from API
            const userIdValue = userData.user_id || userData.id;
            if (userIdValue) {
                this.id = userIdValue;
                this.userId = userIdValue;
                localStorage.setItem('userId', userIdValue);
                localStorage.setItem('id', userIdValue);
            }
            if (userData.namaRole) {
                this.role = userData.namaRole;
                localStorage.setItem('role', userData.namaRole);
            }
            if (userData.menus) {
                this.menus = userData.menus.menus || userData.menus || [];
                localStorage.setItem('menus', JSON.stringify(this.menus));
            }
            if (userData.name) {
                this.name = userData.name;
                localStorage.setItem('name', userData.name);
            }
            
            // Ensure isLoggedIn is true after setting user data
            this.isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
        },

        /**
         * Send forgot password email
         * @param {String} email - User email address
         * @returns {Promise} API response
         */
        async forgotPassword(email) {
            try {
                // console.log('Sending forgot password request for email:', email);
                const authService = new AuthService('auth/forgot-password');
                const response = await authService.post({ email });
                // console.log('Forgot password response:', response);
                return response;
            } catch (error) {
                // console.error('Error sending forgot password request:', error);
                throw error;
            }
        },

        /**
         * Reset password using token
         * @param {Object} resetData - Reset password data
         * @param {String} resetData.token - Reset token from email
         * @param {String} resetData.newPassword - New password
         * @param {String} resetData.confirmPassword - Confirm new password
         * @returns {Promise} API response
         */
        async resetPassword(resetData) {
            try {
                // console.log('Sending reset password request:', resetData);
                const authService = new AuthService('auth/reset-password');
                const response = await authService.post(resetData);
                // console.log('Reset password response:', response);
                return response;
            } catch (error) {
                // console.error('Error resetting password:', error);
                throw error;
            }
        }
    }
});
