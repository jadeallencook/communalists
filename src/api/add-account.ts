import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';
import AccountInterface from '@interfaces/account';

const db = getFirestore(app);

const addAccount = async (value: AccountInterface): Promise<any> =>
    await addDoc(collection(db, 'accounts'), value);

export default addAccount;
