import AccountInterface from '@interfaces/account';
import { Timestamp } from 'firebase/firestore';

export const INITIAL_ACCOUNT_VALUES: AccountInterface = {
    location: 'san-jose-ca',
    joined: Timestamp.fromDate(new Date()),
    lastUpdated: Timestamp.fromDate(new Date()),
};
