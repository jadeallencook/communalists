import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from './init-app';
import AccountInterface from '@interfaces/account';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);

const addAccount = async (value: AccountInterface): Promise<any> => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    const accountsRef = doc(db, 'accounts', uid);
    const response = await setDoc(accountsRef, value);
    return response;
};

export default addAccount;
