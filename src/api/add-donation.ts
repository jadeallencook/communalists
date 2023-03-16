import DonationInterface from '@interfaces/donation';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const addDonation = async (values: DonationInterface): Promise<any> =>
    await addDoc(collection(db, 'donations'), values)
        .then((response) => response)
        .catch((error) => error);

export default addDonation;
