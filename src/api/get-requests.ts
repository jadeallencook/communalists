import { RequestFiltersInterface } from '@interfaces/filters';
import {
    BackendRequestInterface,
    FrontendRequestInterface,
} from '@interfaces/request';
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
    filters: RequestFiltersInterface,
    organizations: string[]
): Promise<{ [key: string]: FrontendRequestInterface }> => {
    const { location, language, stage, driver, coordinator } = filters;
    const requests = {};
    for (let organization of organizations) {
        if (organization) {
            const path = `organizations/${organization}/requests`;
            const ref = collection(db, path);
            const wheres = [
                location && where('location', '==', location),
                language && where('language', '==', language),
                where('stage', '==', stage || 'submitted'),
                driver && where('hasDriver', '==', driver === 'assigned'),
                coordinator && where('coordinator', '==', coordinator),
            ].filter((filter) => Boolean(filter) !== false);

            const q = query(ref, ...wheres);

            const snapshot = await getDocs(q);

            snapshot.forEach((doc) => {
                requests[doc.id] = {
                    ...(doc.data() as BackendRequestInterface),
                    organization,
                };
            });
        }
    }

    return requests;
};

export default getRequests;
