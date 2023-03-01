import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getAccountNames = async (
    uids: string[]
): Promise<{ [key: string]: string }> => {
    const comments = {};
    const querySnapshot = await getDocs(
        query(collection(db, `details/${id}/comments`))
    );
    querySnapshot.forEach((doc) => {
        comments[doc.id] = doc.data();
    });
    return comments;
};

export default getAccountNames;
