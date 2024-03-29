import { FiltersInterface } from '@interfaces/filters';
import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    getDocs,
    query,
    where,
    collection,
} from 'firebase/firestore';
import app from './init-app';
import DonationInterface from '@interfaces/donation';

const db = getFirestore(app);

const getDonations = async (
    filters?: FiltersInterface
): Promise<{ [key: string]: DonationInterface }> => {
    const { location, language, stage, driver, coordinator } = filters;
    const ref = collection(db, 'donations');
    const donations = {};
    let uid: string = '';
    if (coordinator) {
        const { currentUser } = getAuth(app);
        uid = currentUser?.uid;
    }

    const wheres = [
        location && where('location', '==', location),
        language && where('language', '==', language),
        where('stage', '==', stage || 'submitted'),
        driver && where('hasDriver', '==', driver === 'assigned'),
        coordinator && uid && where('coordinator', '==', uid),
    ].filter((filter) => Boolean(filter) !== false);

    const q = query(ref, ...wheres);

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
        donations[doc.id] = doc.data();
    });

    return donations;
};

export default getDonations;
