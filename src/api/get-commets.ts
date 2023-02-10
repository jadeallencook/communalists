import RequestCommentInterface from '@interfaces/request-comment';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getComments = async (
    id: string
): Promise<{ [key: string]: RequestCommentInterface }> => {
    const comments = {};
    const querySnapshot = await getDocs(
        query(collection(db, `details/${id}/comments`))
    );
    querySnapshot.forEach((doc) => {
        comments[doc.id] = doc.data();
    });
    return comments;
};

export default getComments;
