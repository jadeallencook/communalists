import { MethodKeyType } from '@custom-types/methods';
import { LocationKeyType } from '@custom-types/locations';
import { LanguageKeyType } from '@custom-types/languages';
import { StageKeyType } from '@custom-types/stages';
import { Timestamp } from 'firebase/firestore';
import {
    ObjectPronounKeyType,
    SubjectPronounKeyType,
} from '@custom-types/pronouns';

interface RequestAidInterface {
    subjectPronoun: SubjectPronounKeyType;
    objectPronoun: ObjectPronounKeyType;
    name: string;
    email: string;
    phone: string;
    location: LocationKeyType;
    language: LanguageKeyType;
    method: MethodKeyType;
    health: string;
    needs: string;
    stage: StageKeyType;
    timestamp: Timestamp;
    driver: string;
    hasDriver: boolean;
    coordinator: string;

    // organization uids
    organizations: string[];
}

export default RequestAidInterface;
