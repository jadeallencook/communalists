import RequestAidInterface from '@interfaces/request-aid';

const organizeRequestsByDate = (request: {
    [key: string]: RequestAidInterface;
}): [string, RequestAidInterface][] =>
    Object.entries(request).sort(
        ([, { timestamp: timestamp1 }], [, { timestamp: timestamp2 }]) => {
            return timestamp1.seconds - timestamp2.seconds;
        }
    );

export default organizeRequestsByDate;
