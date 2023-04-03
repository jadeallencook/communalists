import {
    getFirestore,
    getDocs,
    query,
    where,
    collection,
} from 'firebase/firestore';
import app from './init-app';
import AccountInterface from '@interfaces/account';

const db = getFirestore(app);

const getUnapprovedAccounts = async (): Promise<{
    [key: string]: AccountInterface;
}> => {
    const ref = collection(db, 'accounts');
    const requests = {};

    const q = query(ref, where('approved', '==', ''));

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });

    return requests;
};

export default getUnapprovedAccounts;
