import { FiltersInterface } from '@interfaces/filters';
import RequestAidInterface from '@interfaces/request-aid';
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getRequests = async (
    filters?: FiltersInterface
): Promise<{ [key: string]: RequestAidInterface }> => {
    const requests = {};

    let q;

    if (filters) {
        const { location, language, stage, driver } = filters;
        const whereFilters = [
            location && where('location', '==', location),
            language && where('language', '==', language),
            stage
                ? where('stage', '==', stage)
                : where('stage', '!=', 'complete'),
            driver && where('hasDriver', '==', driver === 'assigned'),
        ];

        q = query(
            collection(db, 'requests'),
            ...whereFilters.filter((filter) => Boolean(filter) !== false)
        );
    } else {
        q = query(collection(db, 'requests'), where('stage', '!=', 'complete'));
    }

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });
    return requests;
};

export default getRequests;
