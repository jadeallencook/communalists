import { LocationKeyType } from '@custom-types/locations';
import { OrganizationKeyType } from '@custom-types/organizations';
import { Timestamp } from 'firebase/firestore';
import RoleInterface from './roles';

interface VolunteerApplicationInterface {
    name: string;
    email: string;
    location: LocationKeyType;
    details: string;
    approved: string;
    timestamp: Timestamp;
    role: RoleInterface;
    organization: OrganizationKeyType;
}

export default VolunteerApplicationInterface;
