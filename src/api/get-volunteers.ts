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

const getVolunteers = async (): Promise<{
    [key: string]: AccountInterface;
}> => {
    const ref = collection(db, 'accounts');
    const requests = {};

    const wheres = [where('approved', '!=', '')].filter(
        (filter) => Boolean(filter) !== false
    );

    const q = query(ref, ...wheres);

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });

    return requests;
};

export default getVolunteers;
