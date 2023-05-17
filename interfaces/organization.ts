import { Timestamp } from 'firebase/firestore';

interface OrganizationInterface {
    // basic info
    name: string;
    joined: Timestamp;
    lastUpdated: Timestamp;

    // optional info
    website?: string;
    about?: string;
    phone?: number;
    email?: number;

    // moderators uids
    moderators: string[];

    // member uids
    members: string[];

    // member request uids
    requests?: string[];
}

export default OrganizationInterface;
