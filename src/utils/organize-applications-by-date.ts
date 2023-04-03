import AccountInterface from '@interfaces/account';

const organizeApplicationsByDate = (requests: {
    [key: string]: AccountInterface;
}): [string, AccountInterface][] =>
    Object.entries(requests).sort(
        ([, { joined: timestamp1 }], [, { joined: timestamp2 }]) => {
            return timestamp1?.seconds - timestamp2?.seconds;
        }
    );

export default organizeApplicationsByDate;
