import { getFirestore, getDocs, query, collection } from 'firebase/firestore';
import app from './init-app';
import OrganizationInterface from '@interfaces/organization';

const db = getFirestore(app);

const getOrganizations = async (): Promise<{
    [key: string]: OrganizationInterface;
}> => {
    const ref = collection(db, 'organizations');
    const requests = {};

    const q = query(ref);

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        requests[doc.id] = doc.data();
    });

    return requests;
};

export default getOrganizations;
