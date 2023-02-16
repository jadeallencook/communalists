import { LocationKeyType } from '@custom-types/locations';
import { Timestamp } from 'firebase/firestore';

interface VolunteerApplicationInterface {
    name: string;
    email: string;
    location: LocationKeyType;
    details: string;
    approved: { [key: string]: Timestamp };
    isApproved: boolean;
    timestamp: Timestamp;
}

export default VolunteerApplicationInterface;
