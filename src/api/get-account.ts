import AccountInterface from '@interfaces/account';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getAccount = async (uid: string): Promise<AccountInterface> => {
    try {
        const docRef = doc(db, 'accounts', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.data() as AccountInterface;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export default getAccount;
