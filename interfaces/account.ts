import { LocationKeyType } from '@custom-types/locations';
import { OrganizationKeyType } from '@custom-types/organizations';
import RoleInterface from './roles';
import { Timestamp } from 'firebase/firestore';

interface AccountInterface {
    name: string;
    location: LocationKeyType;
    role: RoleInterface;
    organization: OrganizationKeyType;
    approved: string;
    bio: string;
    joined: Timestamp;
    updated: Timestamp;
}

export default AccountInterface;
