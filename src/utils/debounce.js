/**
 * Debounces sebuah fungsi/method, memastikan fungsi hanya dipanggil sekali setelah delay tertentu sejak terakhir kali fungsi dipanggil. Berfungsi untuk limitasi berapa kali fungsi dieksekusi, terutama pada saat merespon events seperti 'keystrokes/onInput', dan 'onChange'.
 *
 * @param {Function} func - Fungsi yang akan didebounce. Fungsi ini akan dipanggil setelah delay tertentu sejak terakhir didebounce.
 * @param {number} delay - Delay dalam milliseconds, jumlah waktu tunggu sebelum fungsi yang didebounce dipanggil.s
 * @returns {Function} - Fungsi yang dikembalikan dapat menerima argument apapun (`...args`), dimana akan diteruskan ke fungsi asal saat dipanggil
 *
 * @example
 * // Contoh penggunaan:
 * const handleOnchange = () => {
 *   console.log('on change input');
 * }
 *
 * const debouncedOnChange = debounce(handleOnchange, 200);
 * window.addEventListener('change', debouncedOnChange);
 *
 *
 * @example
 * // Contoh penggunaan dengan argumen:
 * const handleOnchange = (message) => {
 *   console.log(message);
 * }
 *
 * const debouncedOnChange = debounce(handleOnchange, 200);
 * window.addEventListener('change', debouncedOnChange('Hello world!'));
 */

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

export default debounce;
