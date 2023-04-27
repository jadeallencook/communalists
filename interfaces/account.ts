import { LocationKeyType } from '@custom-types/locations';
import RoleInterface from './roles';
import { Timestamp } from 'firebase/firestore';

interface AccountInterface {
    name: string;
    location: LocationKeyType;
    role: RoleInterface;
    approved: string;
    bio: string;
    joined: Timestamp;
    updated: Timestamp;
}

export default AccountInterface;
