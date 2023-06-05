import AccountInterface from '@interfaces/account';
import { Timestamp } from 'firebase/firestore';

const accountInitialValues: AccountInterface = {
    location: 'san-jose-ca',
    joined: Timestamp.fromDate(new Date()),
    lastUpdated: Timestamp.fromDate(new Date()),
};

export default accountInitialValues;
