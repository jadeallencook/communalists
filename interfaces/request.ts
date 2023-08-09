import { MethodKeyType } from '@custom-types/methods';
import { LocationKeyType } from '@custom-types/locations';
import { LanguageKeyType } from '@custom-types/languages';
import { RequestStageKeyType } from '@custom-types/stages';
import { Timestamp } from 'firebase/firestore';

export interface BackendRequestInterface {
    name: string;
    email: string;
    phone: string;
    location: LocationKeyType;
    language: LanguageKeyType;
    method: MethodKeyType;
    health: string;
    needs: string;
    stage: RequestStageKeyType;
    timestamp: Timestamp;
    driver: string;
    hasDriver: boolean;
    coordinator: string;
}

export interface FrontendRequestInterface extends BackendRequestInterface {
    organization: string;
}
