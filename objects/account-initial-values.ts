import AccountInterface from '@interfaces/account';
import { Timestamp } from 'firebase/firestore';

const accountInitialValues: AccountInterface = {
    name: '',
    location: 'santa-clara-ca',
    organization: 'NONE',
    approved: '',
    bio: '',
    joined: Timestamp.fromDate(new Date()),
    updated: Timestamp.fromDate(new Date()),
    role: {
        coordinator: false,
        driver: false,
        'social-media': false,
        'tech-support': false,
    },
};

export default accountInitialValues;
