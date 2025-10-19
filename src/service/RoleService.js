import AuthUserManagementService from './base/AuthUserManagementService';

const url = 'role';

class RoleService extends AuthUserManagementService {
    constructor() {
        super(url);
    }
}

export default new RoleService();
