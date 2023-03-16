import { MethodKeyType } from '@custom-types/methods';
import { LocationKeyType } from '@custom-types/locations';
import { LanguageKeyType } from '@custom-types/languages';
import { StageKeyType } from '@custom-types/stages';
import { Timestamp } from 'firebase/firestore';

interface DonationInterface {
    name: string;
    email: string;
    phone: string;
    location: LocationKeyType;
    language: LanguageKeyType;
    method: MethodKeyType;
    donation: string;
    stage: StageKeyType;
    timestamp: Timestamp;
    driver: string;
    hasDriver: boolean;
    coordinator: string;
}

export default DonationInterface;
