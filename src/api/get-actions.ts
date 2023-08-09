import { ActionFiltersInterface } from '@interfaces/filters';
import {
    getFirestore,
    getDocs,
    query,
    where,
    collection,
} from 'firebase/firestore';
import app from './init-app';
import {
    BackendActionInterface,
    FrontendActionInterface,
} from '@interfaces/action';

const db = getFirestore(app);

const getActions = async (
    filters: ActionFiltersInterface,
    organizations: string[]
): Promise<{ [key: string]: FrontendActionInterface }> => {
    const { stage, coordinator } = filters;
    const actions = {};
    for (let organization of organizations) {
        const path = `organizations/${organization}/actions`;
        if (organization) {
            const ref = collection(db, path);
            const wheres = [
                where('stage', '==', stage || 'submitted'),
                coordinator && where('coordinator', '==', coordinator),
            ].filter((filter) => Boolean(filter) !== false);

            const q = query(ref, ...wheres);
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
                actions[doc.id] = {
                    ...(doc.data() as BackendActionInterface),
                    organization,
                };
            });
        }
    }

    return actions;
};

export default getActions;
