const uidToUniqueNumber = (uid: string) => {
    let number = 0;
    for (let i = 0; i < uid.length; i++) {
        number += uid.charCodeAt(i);
    }
    return `#${number}`;
};

export default uidToUniqueNumber;
