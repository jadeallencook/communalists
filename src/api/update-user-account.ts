import AccountInterface from '@interfaces/account';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const updateUserAccount = async (uid: string, account: AccountInterface) => {
    const docRef = doc(db, 'accounts', uid);
    await setDoc(docRef, account);
    return true;
};

export default updateUserAccount;
