import TransactionMainService from './base/TransactionMainService';
import http from '@/service/http/transactionApi';

const url = 'export';

class ExportService extends TransactionMainService {
    constructor() {
        super(url);
    }

    async exportFile(module, param, fileName, fileType) {
        try {
            const filename = `${fileName}.${fileType}`;
            const res = await http.get(`${url}/${module}`, {
                params: param,
                responseType: 'blob',
                headers: {
                    "Content-Disposition": "attachment;filename=" + filename,
                    "Content-Type": "application/json" // or "application/vnd.ms-excel"
                }
            },
            );
            const urls = window.URL.createObjectURL(new Blob([res.data]));

            const link = document.createElement('a');
            link.href = urls;

            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();

            // clean up "a" element & remove ObjectURL
            document.body.removeChild(link);
            URL.revokeObjectURL(urls);

        } catch (error) {
            console.log(error);
        }
        ;
    }

    async exportFilePost(module, data, fileName, fileType) {
        try {
            const filename = `${fileName}.${fileType}`;
            const res = await http.post(`${url}/${module}`, data, {
                    responseType: 'blob',
                    headers: {
                        "Content-Disposition": "attachment;filename=" + filename,
                        "Content-Type": "application/json" // or "application/vnd.ms-excel"
                    }
                },

            );
            const urls = window.URL.createObjectURL(new Blob([res.data]));

            const link = document.createElement('a');
            link.href = urls;

            link.setAttribute('download', filename); //or any other extension
            document.body.appendChild(link);
            link.click();

            // clean up "a" element & remove ObjectURL
            document.body.removeChild(link);
            URL.revokeObjectURL(urls);

        } catch (error) {
            console.log(error);
        };
    }

}

export default new ExportService();
