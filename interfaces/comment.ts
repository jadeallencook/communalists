import { Timestamp } from 'firebase/firestore';

interface CommentInterface {
    timestamp: Timestamp;
    body: string;
    user: string;
    isArchived: boolean;
}

export default CommentInterface;
