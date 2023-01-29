import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';
import RequestAidInterface from '@interfaces/request-aid';
import FirebaseResponseInterface from '@interfaces/firebase-response';

const db = getFirestore(app);

const addRequest = async (
	values: RequestAidInterface
): Promise<FirebaseResponseInterface> =>
	await addDoc(collection(db, 'requests'), values)
		.then(() => ({ isError: false, message: 'Success!' }))
		.catch(({ message }) => ({ isError: true, message }));

export default addRequest;
