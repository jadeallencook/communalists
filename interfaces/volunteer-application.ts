import { Timestamp } from 'firebase/firestore';
import AccountInterface from './account';

interface VolunteerApplicationInterface extends AccountInterface {
    email: string;
    details: string;
    approved: string;
    timestamp: Timestamp;
}

export default VolunteerApplicationInterface;
