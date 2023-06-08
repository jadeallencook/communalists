import { LocationKeyType } from '@custom-types/locations';
import { Timestamp } from 'firebase/firestore';

interface AccountInterface {
    location: LocationKeyType;
    joined: Timestamp;
    lastUpdated: Timestamp;
}

export default AccountInterface;
