import { FiltersInterface } from '@interfaces/filters';
import RequestAidInterface from '@interfaces/request-aid';
import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    getDocs,
    query,
    where,
    collection,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getRequests = async (
    filters?: FiltersInterface
): Promise<{ [key: string]: RequestAidInterface }> => {
    const { location, language, stage, driver, coordinator } = filters;
    const ref = collection(db, 'requests');
    const requests = {};
    let uid: string = '';
    if (coordinator) {
        const { currentUser } = getAuth(app);
        uid = currentUser?.uid;
    }

    const wheres = [
        location && where('location', '==', location),
        language && where('language', '==', language),
        where('stage', '==', stage || 'submitted'),
        driver && where('hasDriver', '==', driver === 'assigned'),
        coordinator && uid && where('coordinator', '==', uid),
    ].filter((filter) => Boolean(filter) !== false);

    const q = query(ref, ...wheres);

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });

    return requests;
};

export default getRequests;
