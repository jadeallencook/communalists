import { FiltersType } from '@custom-types/filters';
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
    filters?: FiltersType
): Promise<{ [key: string]: RequestAidInterface }> => {
    const requests = {};

    let q;

    if (filters) {
        const whereFilters = [
            filters.location && where(
                'location', '==', filters.location
            ),
            filters.language && where(
                'language', '==', filters.language
            ),
            filters.stage && where(
                'stage', '==', filters.stage
            ),
            filters.driver && where(
                'hasDriver', '==', filters.driver === 'assigned'
            )
        ];

        q = query(
            collection(db, 'requests'),
            ...whereFilters.filter((filter) => Boolean(filter) !== false)
        );

    } else {
        q = query(
            collection(db, 'requests'),
            where('stage', '!=', 'complete')
        );
    }

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });
    return requests;
};

export default getRequests;
