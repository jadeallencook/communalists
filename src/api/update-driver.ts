import { getAuth } from 'firebase/auth';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);
const auth = getAuth();

const updateDriver = async (id: string, remove: boolean) => {
    const { uid } = auth.currentUser;
    const docRef = doc(db, 'requests', id);
    return await updateDoc(docRef, {
        driver: remove ? '' : uid,
    })
        .then((response) => response)
        .catch((response) => response);
};

export default updateDriver;
