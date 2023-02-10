import RequestAidInterface from '@interfaces/request-aid';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const addRequest = async (values: RequestAidInterface): Promise<any> =>
	await addDoc(collection(db, 'requests'), values)
		.then((response) => response)
		.catch((error) => error);

export default addRequest;
