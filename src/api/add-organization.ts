import {
    getFirestore,
    collection,
    addDoc,
    Timestamp,
} from 'firebase/firestore';
import app from './init-app';
import { getAuth } from 'firebase/auth';
import OrganizationInterface from '@interfaces/organization';

const db = getFirestore(app);

const addOrganization = async (name: string): Promise<any> => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    const organization: OrganizationInterface = {
        name,
        admins: [uid],
        members: [uid],
        joined: Timestamp.fromDate(new Date()),
        updated: Timestamp.fromDate(new Date()),
    };
    const response = await addDoc(collection(db, 'organizations'), organization)
        .then((response) => response)
        .catch((error) => error);
    return response;
};

export default addOrganization;
