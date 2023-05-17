import AccountInterface from '@interfaces/account';
import {
    getFirestore,
    doc,
    getDoc,
    documentId,
    collection,
    where,
    query,
    getDocs,
    limit,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getAccount = async (uid: string): Promise<AccountInterface> => {
    try {
        const docRef = doc(db, 'accounts', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.data() as AccountInterface;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export const getAccounts = async (
    uids: string[]
): Promise<{ [key: string]: AccountInterface }> => {
    try {
        const map: { [key: string]: AccountInterface } = {};
        const length = uids.length;
        const sets = Math.ceil(length / 10);

        for (let i = 0; i < sets; i++) {
            const start = i * 10;
            const end = (i + 1) * 10;
            const set = uids.slice(start, end);
            const ref = collection(db, 'accounts');
            const q = query(ref, where(documentId(), 'in', set));
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
                map[doc.id] = doc.data() as AccountInterface;
            });
        }

        return map;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export default getAccount;
