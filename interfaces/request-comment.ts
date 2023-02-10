import { Timestamp } from 'firebase/firestore';

interface RequestCommentInterface {
    uid: string;
    timestamp: Timestamp;
    body: string;
}

export default RequestCommentInterface;
