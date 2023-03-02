import {
    getFirestore,
    collection,
    query,
    where,
    documentId,
    getDocs,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getUsernames = async (
    uids: string[]
): Promise<{ [key: string]: string }> => {
    const map: { [key: string]: string } = {};
    const ref = collection(db, 'accounts');
    const q = query(ref, where(documentId(), 'in', uids));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
        const { username } = doc.data();
        map[doc.id] = `@${username}`;
    });
    return map;
};

export default getUsernames;
