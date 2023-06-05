import { getDatabase, ref, set } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from './init-app';

getFirestore(app);
const auth = getAuth();

const updateUserDisplayName = async (displayName: string) => {
    const { uid } = auth.currentUser;
    const db = getDatabase();
    return await set(ref(db, `displayNames/${uid}`), displayName);
};

export default updateUserDisplayName;
