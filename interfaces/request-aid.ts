import { MethodKeyTypes } from '@custom-types/methods';
import { LocationKeyType } from '@custom-types/locations';
import { LanguageKeyTypes } from '@custom-types/languages';
import { StageKeyType } from '@custom-types/stages';
import { Timestamp } from 'firebase/firestore';

interface RequestAidInterface {
    name: string;
    email: string;
    phone: string;
    location: LocationKeyType;
    language: LanguageKeyTypes;
    method: MethodKeyTypes;
    health: string;
    needs: string;
    stage: StageKeyType;
    submitted: Timestamp;
}

export default RequestAidInterface;
