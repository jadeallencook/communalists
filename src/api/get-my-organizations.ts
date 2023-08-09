import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    query,
    where,
    collection,
    getDocs,
} from 'firebase/firestore';
import app from './init-app';
import OrganizationInterface from '@interfaces/organization';

const db = getFirestore(app);

const getMyOrganizations = async (): Promise<{
    [id: string]: OrganizationInterface;
}> => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    try {
        const organizations = {};
        const ref = collection(db, 'organizations');
        const q = query(ref, where(`members.${uid}`, '!=', null));
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
            organizations[doc.id] = doc.data();
        });
        return organizations;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export default getMyOrganizations;
