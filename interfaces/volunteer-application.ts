import { LocationKeyType } from '@custom-types/locations';
import { Timestamp } from 'firebase/firestore';

interface VolunteerApplicationInterface {
    // applicant information
    name: string;
    email: string;
    location: LocationKeyType;
    details: string;

    // uid of whoever approved
    approved: string;

    // timestamp of submission
    timestamp: Timestamp;

    // volunteer roles
    coordinator: boolean;
    driver: boolean;
}

export default VolunteerApplicationInterface;
