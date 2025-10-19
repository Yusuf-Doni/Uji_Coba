import http from './http/apiBackEnd';

class PasswordService {
    /**
     * Send forgot password email
     * @param {string} email - User's email address
     * @returns {Promise} API response
     */
    async forgotPassword(email) {
        try {
            const response = await http.post('/auth/forgot-password', { email });
            return response;
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            throw error;
        }
    }

    /**
     * Validate reset password token
     * @param {string} token - Reset password token
     * @returns {Promise} API response
     */
    async validateResetToken(token) {
        try {
            const response = await http.get(`/auth/validate-reset-token?token=${token}`);
            return response;
        } catch (error) {
            console.error('Error in validateResetToken:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param {Object} data - Reset password data
     * @param {string} data.token - Reset password token
     * @param {string} data.newPassword - New password
     * @returns {Promise} API response
     */
    async resetPassword(data) {
        try {
            const response = await http.post('/auth/reset-password', {
                token: data.token,
                newPassword: data.newPassword
            });
            return response;
        } catch (error) {
            console.error('Error in resetPassword:', error);
            throw error;
        }
    }

    /**
     * Change password (for logged in users)
     * @param {Object} data - Change password data
     * @param {string} data.oldPassword - Current password
     * @param {string} data.newPassword - New password
     * @returns {Promise} API response
     */
    async changePassword(data) {
        try {
            const response = await http.put('/auth/change-password', {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword
            });
            return response;
        } catch (error) {
            console.error('Error in changePassword:', error);
            throw error;
        }
    }
}

export default new PasswordService();

