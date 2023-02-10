import { Timestamp } from 'firebase/firestore';

const timestampToCommentString = (timestamp: Timestamp): string => {
    const date: Date = new Date(timestamp.seconds * 1000);
    const year = date.getFullYear();
    const time = date.toLocaleTimeString();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return `${month}/${day}/${year} ${time}`;
};

export default timestampToCommentString;
