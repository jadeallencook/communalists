import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './init-app';
import { FrontendActionInterface } from '@interfaces/action';

const db = getFirestore(app);

const getIndividualAction = async (id: string, organization: string) => {
    const path = `organizations/${organization}/actions`;
    try {
        const docRef = doc(db, path, id);
        const docSnap = await getDoc(docRef);
        return docSnap.data() as FrontendActionInterface;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export default getIndividualAction;
