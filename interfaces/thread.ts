import { Timestamp } from 'firebase/firestore';
import CommentInterface from './comment';

interface ThreadInterface {
    comments: CommentInterface[];
    lastModified: Timestamp;
}

export default ThreadInterface;
