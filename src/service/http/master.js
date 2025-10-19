import axios from 'axios';

export default axios.create({
    baseURL: import.meta.env.VITE_BASE_URL_MASTER,
    headers: {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
});
