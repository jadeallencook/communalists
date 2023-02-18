const formatPhoneNumer = (event): string => {
    const { value } = event.target;
    let numbers = ('' + value).replace(/\D/g, '');
    const matches = numbers.match(/.{1,3}/g);
    let formatted = '';

    if (!matches) {
        return formatted;
    }

    const length = matches.length;

    if (length === 1) {
        formatted = `(${matches[0]}`;
    } else if (length === 2) {
        formatted = `(${matches[0]}) ${matches[1]}`;
    } else if (length === 3) {
        formatted = `(${matches[0]}) ${matches[1]}-${matches[2]}`;
    } else if (length === 4) {
        formatted = `(${matches[0]}) ${matches[1]}-${matches[2]}${matches[3][0]}`;
    }

    return formatted;
};

export default formatPhoneNumer;
