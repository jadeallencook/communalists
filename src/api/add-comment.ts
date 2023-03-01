import RequestCommentInterface from '@interfaces/request-comment';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const addComment = async (
    value: RequestCommentInterface,
    id: string
): Promise<any> => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    return await addDoc(collection(db, 'details', id, 'comments'), {
        ...value,
        uid,
    })
        .then((response) => response)
        .catch((error) => error);
};

export default addComment;
