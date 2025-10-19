import axios from 'axios';

export default axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_FILE_API,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
});
