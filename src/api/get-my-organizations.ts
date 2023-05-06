import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    query,
    where,
    collection,
    getDocs,
} from 'firebase/firestore';
import app from './init-app';

const db = getFirestore(app);

const getMyOrganizations = async (): Promise<string[]> => {
    const {
        currentUser: { uid },
    } = getAuth(app);
    try {
        const organizations = [];
        const ref = collection(db, 'organizations');
        const q = query(ref, where('members', 'array-contains', uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(({ id }) => organizations.push(id));
        return organizations;
    } catch (err) {
        console.log(err);
        return null;
    }
};

export default getMyOrganizations;
