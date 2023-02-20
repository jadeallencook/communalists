import RequestAidInterface from '@interfaces/request-aid';
import {
    getFirestore,
    getDocs,
    query,
    where,
    collection,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getApplications = async (): Promise<{
    [key: string]: RequestAidInterface;
}> => {
    const ref = collection(db, 'applications');
    const requests = {};

    const q = query(ref, where('approved', '==', ''));

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });

    return requests;
};

export default getApplications;
