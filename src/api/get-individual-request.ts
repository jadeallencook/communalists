import {
    BackendRequestInterface,
    FrontendRequestInterface,
} from '@interfaces/request';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getIndividualRequest = async (
    uid: string,
    organization: string
): Promise<FrontendRequestInterface> => {
    const path = `organizations/${organization}/requests`;
    try {
        const docRef = doc(db, path, uid);
        const docSnap = await getDoc(docRef);
        return {
            ...(docSnap.data() as BackendRequestInterface),
            organization,
        };
    } catch (err) {
        console.log(err);
        return null;
    }
};

export default getIndividualRequest;
