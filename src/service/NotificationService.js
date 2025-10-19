import TransactionMainService from './base/TransactionMainService';

const url = 'notification';

class NotificationService extends TransactionMainService {
    constructor() {
        super(url);
    }

    read(param, id) {
        return this.get(param, `${url}/read/${id}`);
    }

    count(param) {
        return this.get(param, `${url}/count`);
    }
}

export default new NotificationService();
