import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';
import { FrontendActionInterface } from '@interfaces/action';

const db = getFirestore(app);

const addAction = async (values: FrontendActionInterface): Promise<any> => {
    const { organization, ...rest } = values;
    const path = `organizations/${organization}/actions`;
    return await addDoc(collection(db, path), rest)
        .then((response) => response?.id)
        .catch((error) => error);
};

export default addAction;
