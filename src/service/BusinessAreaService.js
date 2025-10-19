import MasterMainService from './base/MasterMainService';

const url = 'business_area';

class BusinessAreaService extends MasterMainService {
    constructor() {
        super(url);
    }

    getActive(param) {
        return this.get(param, `${url}/active`);
    }

    getByCompanyCode(companyCode, param) {
        return this.get(param, `${url}/company/${companyCode}`);
    }
}

export default new BusinessAreaService();
