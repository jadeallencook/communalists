import { Timestamp } from 'firebase/firestore';

const getNumberOfDaysAfterDate = (timestamp: Timestamp): string => {
    const date = new Date(timestamp.seconds * 1000).getTime();
    const now = new Date().getTime();
    const timediff: any = now - date;
    const millisecondsInDay = 86400000;
    const millisecondsInHour = 3600000;
    const millisecondsInMinute = 60000;
    const days = Math.floor(timediff / millisecondsInDay);
    const minutes = Math.floor(timediff / millisecondsInMinute);
    const hours = Math.floor(timediff / millisecondsInHour);

    if (days) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
};

export default getNumberOfDaysAfterDate;
