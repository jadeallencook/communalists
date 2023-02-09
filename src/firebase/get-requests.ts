import RequestAidInterface from '@interfaces/request-aid';
import {
	getFirestore,
	collection,
	getDocs,
	query,
	where,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getRequests = async (
	key?: string,
	value?: string
): Promise<{ [key: string]: RequestAidInterface }> => {
	const requests = {};
	let q =
		key && value
			? query(collection(db, 'requests'), where(key, '==', value))
			: collection(db, 'requests');
	const querySnapshot = await getDocs(q);
	querySnapshot.forEach((doc) => {
		requests[doc.id] = doc.data();
	});
	return requests;
};

export default getRequests;
