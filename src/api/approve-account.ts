import { Timestamp, doc, getFirestore, updateDoc } from 'firebase/firestore';
import app from './init-app';
import { getAuth } from 'firebase/auth';
import AccountInterface from '@interfaces/account';

interface UpdatedAccountInterface extends Partial<AccountInterface> {}

const db = getFirestore(app);

const approveAccount = async (user: string) => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    const account: UpdatedAccountInterface = {
        updated: Timestamp.fromDate(new Date()),
        approved: uid,
    };
    const docRef = doc(db, 'accounts', user);
    const response = await updateDoc(docRef, account);
    return response;
};

export default approveAccount;
