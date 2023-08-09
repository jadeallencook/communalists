import { BackendRequestInterface } from '@interfaces/request';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const addRequest = async (
    values: BackendRequestInterface,
    organization: string
): Promise<any> => {
    const path = `organizations/${organization}/requests`;
    return await addDoc(collection(db, path), values)
        .then((response) => response)
        .catch((error) => error);
};

export default addRequest;
