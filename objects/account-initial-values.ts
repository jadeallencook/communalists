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
        driver: false,
        coordinator: false,
        tech: false,
        social: false,
        laborer: false,
        photographer: false,
        cook: false,
        planner: false,
        designer: false,
        emotional: false,
        security: false,
        legal: false,
        medical: false,
    },
};

export default accountInitialValues;
