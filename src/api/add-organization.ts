import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from './init-app';
import OrganizationInterface from '@interfaces/organization';

const db = getFirestore(app);

const addOrganization = async (
    organization: OrganizationInterface
): Promise<any> => {
    const path = 'organizations';
    const response = await addDoc(collection(db, path), organization)
        .then((response) => response?.id)
        .catch((error) => error);
    return response;
};

export default addOrganization;
