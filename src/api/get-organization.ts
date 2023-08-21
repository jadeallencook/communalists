import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './init-app';
import OrganizationInterface from '@interfaces/organization';

const db = getFirestore(app);

const getOrganization = async (id: string): Promise<OrganizationInterface> => {
    const ref = doc(db, 'organizations', id);
    const docSnap = await getDoc(ref);
    return docSnap.data() as OrganizationInterface;
};

export default getOrganization;
