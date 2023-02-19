import { FiltersInterface } from '@interfaces/filters';
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

const getRequests = async (
    filters?: FiltersInterface
): Promise<{ [key: string]: RequestAidInterface }> => {
    const { location, language, stage, driver } = filters;
    const ref = collection(db, 'requests');
    const requests = {};

    const wheres = [
        location && where('location', '==', location),
        language && where('language', '==', language),
        where('stage', '==', stage || 'submitted'),
        driver && where('hasDriver', '==', driver === 'assigned'),
    ].filter((filter) => Boolean(filter) !== false);

    const q = query(ref, ...wheres);

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });

    return requests;
};

export default getRequests;
