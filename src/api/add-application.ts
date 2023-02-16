import VolunteerApplicationInterface from '@interfaces/volunteer-application';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const addApplication = async (
    value: VolunteerApplicationInterface
): Promise<any> => await addDoc(collection(db, 'applications'), value);

export default addApplication;
