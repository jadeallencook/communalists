import { ActionStageKeyType } from '@custom-types/stages';
import { Timestamp } from 'firebase/firestore';

export interface BackendActionInterface {
    title: string;
    body: string;
    stage: ActionStageKeyType;
    timestamp: Timestamp;
    coordinator: string;
    createdBy: string;
}

export interface FrontendActionInterface extends BackendActionInterface {
    organization: string;
}
