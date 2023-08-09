import { Timestamp } from 'firebase/firestore';

export interface OrganizationMemberInterface {
    isModerator: boolean;
    isBlocked: boolean;
    isOwner: boolean;
    isMember: boolean;
    addedBy: string;
    blockedBy: string;
    joined: Timestamp;
    lastUpdated: Timestamp;
}

export interface OrganizationInterface {
    // basic info
    name: string;
    joined: Timestamp;
    lastUpdated: Timestamp;

    // optional info
    website?: string;
    about?: string;
    phone?: number;
    email?: string;

    // members
    members: {
        [uid: string]: OrganizationMemberInterface;
    };
}

export default OrganizationInterface;
