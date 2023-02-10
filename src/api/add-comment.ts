import RequestCommentInterface from '@interfaces/request-comment';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const addComment = async (
    value: RequestCommentInterface,
    id: string
): Promise<any> =>
    await addDoc(collection(db, 'details', id, 'comments'), value)
        .then((response) => response)
        .catch((error) => error);

export default addComment;
