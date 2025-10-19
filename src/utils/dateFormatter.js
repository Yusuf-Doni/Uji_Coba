const listBulanFull = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
];

const listBulanShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des'
];

/**
 * Format tanggal dalam string format tertentu.
 *
 * @param {Date|string} value - nilai Tanggal yang akan diformat. Bisa beripe Date Object atau Date string.
 * - Contoh valid string tanggal: `'Fri Jan 03 2025 00:00:00 GMT+0700 (Western Indonesia Time)'`.
 * - Contoh Date Object: `new Date(2025. 0, 3)`.
 *
 * @param {string} format - Format yang digunakan untuk memformat tanggal. Format yang didukung adalah:
 * - `'DD/MM/YYYY'`: day, month, year dipisahkan oleh `/` (e.g., `"03/01/2025"`)
 * - `'YYYY-MM-DD'`: year, month, day dipisahkan oleh `-` (e.g., `"2025-01-03"`)
 * - `'DD-MM-YYYY'`: day, month, year dipisahkan oleh `-` (e.g., `"03-01-2025"`)
 * - `'MM/YYYY'`: month, year dipisahkan oleh `/` (e.g., `"01/2025"`)
 * - `'DD MMM YYYY'`: day, month, year (e.g., `"05 Jan 2025"`)
 * - `'DD MMMM YYYY'`: day, month, year (e.g., `"05 Januari 2025"`)
 * - `'YYYYMMMDD_HHmmss'`: year, month, day, hours, minutes, seconds (e.g., `"2025Jan05_083012"`)
 * - `'DD/MM/YYYY HH:mm:ss'`: day, month, year, hours, minutes, seconds (e.g., `"05/01/2025 08:30:12"`)
 *
 * @returns {string} - String yang sudah diformat.
 *
 * @example
 * const dateValue = 'Fri Jan 03 2025 00:00:00 GMT+0700 (Western Indonesia Time)';
 *
 * formatDate(dateValue, 'DD/MM/YYYY')
 */
const formatDate = (value, format) => {
    const date = new Date(value);
    const [month, day, year, hours, minutes, second] = [
        (date.getMonth() + 1).toString().padStart(2, 0),
        date.getDate().toString().padStart(2, 0),
        date.getFullYear(),
        date.getHours().toString().padStart(2, 0),
        date.getMinutes().toString().padStart(2, 0),
        date.getSeconds().toString().padStart(2, 0)
    ];

    if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    }

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    }

    if (format === 'DD-MM-YYYY') {
        return `${day}-${month}-${year}`;
    }

    if (format === 'MM/YYYY') {
        return `${month}/${year}`;
    }

    if (format === 'DD MMM YYYY') {
        return `${day} ${listBulanShort[month - 1]} ${year}`;
    }

    if (format === 'DD MMMM YYYY') {
        return `${day} ${listBulanFull[month - 1]} ${year}`;
    }

    if (format === 'YYYYMMMDD_HHmmss') {
        return `${year}${month}${day}_${hours}${minutes}${second}`;
    }

    if (format === 'DD/MM/YYYY HH:mm:ss') {
        return `${day}/${month}/${year} ${hours}:${minutes}:${second}`;
    }

    return value;
};

/**
 * Unformat tanggal dari response backend. Format dari backend `'DD-MM-YYYY' (e.g., 05-01-2025)`.
 *
 * @param {string} value - nilai Tanggal yang akan diformat. Bisa beripe Date Object atau Date string.
 * - Contoh valid string tanggal: `'05-01-2025'`.
 *
 * @returns {string} - String yang sudah diunformat.
 * - Contoh nilai string yang diunformat: `'Fri Jan 03 2025 00:00:00 GMT+0700 (Western Indonesia Time)'`
 *
 * @example
 * const dateValue = '05-01-2025';
 *
 * unformatDate(dateValue)
 */
const unformatDate = (value) => {
    const [day, month, year] = value.split('-');
    const dateType = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10));

    return dateType.toString();
};

/**
 * Unformat tanggal dan waktu dari response backend. Format dari backend `'DD-MM-YYYY HH:mm:ss' (e.g., 05-01-2025 08:30:12)`.
 *
 * @param {string} value - nilai Tanggal yang akan diformat. Bisa beripe Date Object atau Date string.
 * - Contoh valid string tanggal: `'05-01-2025 08:30:12'`.
 *
 * @returns {string} - String yang sudah diunformat.
 * - Contoh nilai string yang diunformat: `'Fri Jan 03 2025 08:30:12 GMT+0700 (Western Indonesia Time)'`
 *
 * @example
 * const dateValue = '05-01-2025 08:30:12';
 *
 * unformatDate(dateValue)
 */
const unformatDateTime = (value) => {
    const [dateValue, timeValue] = value.split(' ');
    const [day, month, year] = dateValue.split('-');
    const [hours, minutes, seconds] = timeValue.split(':');

    const dateType = new Date(
        year,
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        hours,
        minutes,
        seconds
    );

    return dateType.toString();
};

export { formatDate, unformatDate, unformatDateTime };
