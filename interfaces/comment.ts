import { Timestamp } from 'firebase/firestore';

interface CommentInterface {
    timestamp: Timestamp;
    body: string;
    user: string;
    thread: string;
}

export default CommentInterface;
