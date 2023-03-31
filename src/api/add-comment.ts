import RequestCommentInterface from '@interfaces/request-comment';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const addComment = async (
    value: RequestCommentInterface,
    request: string
): Promise<any> => {
    const {
        currentUser: { uid: user },
    } = getAuth(app);
    return await addDoc(collection(db, 'comments'), {
        ...value,
        user,
        request,
    })
        .then((response) => response)
        .catch((error) => error);
};

export default addComment;
