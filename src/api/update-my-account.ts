import AccountInterface from '@interfaces/account';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const updateMyAccount = async (account: AccountInterface) => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    const docRef = doc(db, 'accounts', uid);
    const response = await setDoc(docRef, account);
    return response;
};

export default updateMyAccount;
