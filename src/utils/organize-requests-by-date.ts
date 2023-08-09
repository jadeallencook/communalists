import { FrontendRequestInterface } from '@interfaces/request';

const organizeRequestsByDate = (requests: {
    [key: string]: FrontendRequestInterface;
}): [string, FrontendRequestInterface][] =>
    Object.entries(requests).sort(
        ([, { timestamp: timestamp1 }], [, { timestamp: timestamp2 }]) => {
            return timestamp1.seconds - timestamp2.seconds;
        }
    );

export default organizeRequestsByDate;
