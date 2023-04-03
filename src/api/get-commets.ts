import RequestCommentInterface from '@interfaces/comment';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getComments = async (
    id: string
): Promise<{ [key: string]: RequestCommentInterface }> => {
    const ref = collection(db, 'comments');
    const q = query(ref, where('thread', '==', id));
    const snapshot = await getDocs(q);
    const comments = {};
    snapshot.forEach((doc) => (comments[doc.id] = doc.data()));
    return comments;
};

export default getComments;
