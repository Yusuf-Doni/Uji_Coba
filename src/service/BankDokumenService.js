import MasterMainService from './base/MasterMainService';

const url = 'bank_document';

class BankDokumenService extends MasterMainService {
    constructor() {
        super(url);
    }
}

export default new BankDokumenService();
