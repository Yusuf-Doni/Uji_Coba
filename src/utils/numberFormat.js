const formatToPlainDecimal = (numberValue) => {
    if (numberValue) {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            maximumFractionDigits: 2
        }).format(numberValue);
    }

    return numberValue;
};

const formatToIDRWithRp = (numberValue) => {
    if (numberValue) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            maximumFractionDigits: 2,
            currency: 'IDR'
        }).format(numberValue);
    }

    return numberValue;
};

export { formatToIDRWithRp, formatToPlainDecimal };
