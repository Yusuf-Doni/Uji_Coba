function omit(obj, keysToOmit) {
    if (!obj || typeof obj !== 'object') {
      return {}; // Mengembalikan objek kosong jika input tidak valid
    }
  
    if (!Array.isArray(keysToOmit)) {
      keysToOmit = [keysToOmit]; // Konversi ke array jika bukan array
    }
  
    const newObj = {};
    for (const key in obj) {
      if (!keysToOmit.includes(key) && obj.hasOwnProperty(key)) {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }

  export default omit;