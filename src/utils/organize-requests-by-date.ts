import DonationInterface from '@interfaces/donation';
import RequestAidInterface from '@interfaces/request-aid';

const organizeRequestsByDate = (requests: {
    [key: string]: RequestAidInterface | DonationInterface;
}): [string, RequestAidInterface | DonationInterface][] =>
    Object.entries(requests).sort(
        ([, { timestamp: timestamp1 }], [, { timestamp: timestamp2 }]) => {
            return timestamp1.seconds - timestamp2.seconds;
        }
    );

export default organizeRequestsByDate;
