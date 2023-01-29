import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

interface ResponseInterface {
	isError: boolean;
	message: string;
}

const db = getFirestore(app);

const addRequest = async (
	values: ResponseInterface
): Promise<ResponseInterface> =>
	await addDoc(collection(db, 'requests'), values)
		.then(() => ({ isError: false, message: 'Success!' }))
		.catch(({ message }) => ({ isError: true, message }));

export default addRequest;
