import { Timestamp } from 'firebase/firestore';

interface RequestCommentInterface {
    timestamp: Timestamp;
    body: string;
    user: string;
    request: string;
}

export default RequestCommentInterface;
