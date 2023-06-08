import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from './init-app';
import { getAuth } from 'firebase/auth';
import SignUpInterface from '@interfaces/sign-up';
import updateUserDisplayName from './update-user-display-name';

const db = getFirestore(app);

const addAccount = async (
    value: Omit<SignUpInterface, 'email' | 'password' | 'confirmedPassword'>
): Promise<void> => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    const { name, ...rest } = value;
    const accountsRef = doc(db, 'accounts', uid);
    await setDoc(accountsRef, rest);
    await updateUserDisplayName(name);
};

export default addAccount;
